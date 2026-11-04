

import json

import re

import sys

from datetime import datetime

from pathlib import Path

from xml.sax.saxutils import escape



from reportlab.lib import colors

from reportlab.lib.enums import TA_CENTER, TA_LEFT

from reportlab.lib.pagesizes import A4

from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from reportlab.lib.units import cm

from reportlab.platypus import (

    BaseDocTemplate,

    PageTemplate,

    Frame,

    Paragraph,

    Spacer,

    PageBreak,

    Image,

    Table,

    TableStyle,

    KeepTogether,

    PageBreakIfNotEmpty,

)

from reportlab.platypus.tableofcontents import TableOfContents





# ============================================================

# CONFIGURATION

# ============================================================



PROJECT_DIR = Path(__file__).resolve().parent.parent



JSON_REPORT = PROJECT_DIR / "Reports" / "playwright-results.json"

TEST_RESULTS_DIR = PROJECT_DIR / "test-results"

OUTPUT_DIR = PROJECT_DIR / "Reports" / "Individual"



TESTER_NAME = "Irvandi Pransena Hutapea"



PAGE_WIDTH, PAGE_HEIGHT = A4

LEFT_MARGIN = 1.8 * cm

RIGHT_MARGIN = 1.8 * cm

TOP_MARGIN = 1.8 * cm

BOTTOM_MARGIN = 1.8 * cm





# ============================================================

# HELPER FUNCTIONS

# ============================================================



def safe_filename(value):

    """Make a Windows-safe filename."""

    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "", str(value))

    value = re.sub(r"\s+", "_", value.strip())

    return value[:100] or "Test_Report"





def clean_text(value):

    """Escape text before inserting it into a Paragraph."""

    return escape(str(value or ""))





def format_duration(milliseconds):

    try:

        return f"{float(milliseconds or 0) / 1000:.2f}s"

    except (ValueError, TypeError):

        return "0.00s"





def flatten_suites(suites, parent_titles=None):

    """

    Extract individual test cases from Playwright JSON reporter output.

    The displayed test title will be the spec title only.

    """

    parent_titles = parent_titles or []

    found = []



    for suite in suites or []:

        suite_title = suite.get("title", "")

        current_titles = parent_titles.copy()



        if suite_title:

            current_titles.append(suite_title)



        for spec in suite.get("specs", []) or []:

            for test in spec.get("tests", []) or []:

                results = test.get("results", []) or []

                last_result = results[-1] if results else {}



                duration = last_result.get("duration", 0)

                status = (

                    last_result.get("status")

                    or test.get("status")

                    or "unknown"

                )



                errors = []

                for result in results:

                    for error in result.get("errors", []) or []:

                        message = error.get("message")

                        if message:

                            errors.append(message)



                # Use only the test case title, not the file/suite hierarchy.

                title = spec.get("title") or test.get("title") or "Untitled Test"



                found.append({

                    "title": title,

                    "full_title": " > ".join(

                        current_titles + [title]

                    ),

                    "status": status,

                    "duration": duration,

                    "errors": errors,

                    "results": results,

                    "test_file": spec.get("file", ""),

                    "line": spec.get("line", ""),

                })



        found.extend(

            flatten_suites(

                suite.get("suites", []) or [],

                current_titles,

            )

        )



    return found





def read_manifests():

    """Read step-evidence.json files under test-results."""

    manifests = []



    if not TEST_RESULTS_DIR.exists():

        return manifests



    for manifest_path in TEST_RESULTS_DIR.rglob("step-evidence.json"):

        try:

            with manifest_path.open("r", encoding="utf-8") as file:

                data = json.load(file)



            manifests.append({

                "path": manifest_path,

                "data": data,

                "folder": manifest_path.parent.name,

            })

        except (OSError, json.JSONDecodeError) as exc:

            print(f"[WARN] Gagal membaca manifest {manifest_path}: {exc}")



    return manifests







def get_manifest_title(data):

    # Manifest bisa berbentuk list atau dictionary.

    if isinstance(data, list):

        for entry in data:

            if isinstance(entry, dict):

                title = get_manifest_title(entry)

                if title:

                    return title

        return ""



    if not isinstance(data, dict):

        return ""



    for key in (

        "testTitle",

        "testName",

        "title",

        "name",

        "fullTitle",

    ):

        value = data.get(key)



        if isinstance(value, str) and value.strip():

            return value.strip()



    return ""





def match_manifest(test, manifests):

    """Match each Playwright test to its evidence manifest."""

    import re

    from pathlib import Path



    def normalize(value):

        return re.sub(r"[^a-z0-9]", "", str(value or "").lower())



    title = normalize(test.get("title", ""))

    full_title = normalize(test.get("full_title", ""))

    test_file = str(test.get("test_file") or test.get("file") or "")

    file_name = normalize(Path(test_file).stem) if test_file else ""



    print(f"[DEBUG MATCH] Test title : {test.get('title', '')}")

    print(f"[DEBUG MATCH] Test file  : {test_file}")



    candidates = []



    for item in manifests:

        folder_raw = str(item.get("folder") or "")

        folder = normalize(folder_raw)

        data = item.get("data")



        score = 0



        # Utamakan kecocokan nama file test.

        if file_name and file_name in folder:

            score += 120



        # Cocokkan judul test dengan nama folder evidence.

        if title and title in folder:

            score += 100



        if full_title and full_title in folder:

            score += 80



        print(

            f"[DEBUG MATCH] Folder: {folder_raw} | "

            f"Score: {score}"

        )



        if score > 0:

            candidates.append((score, item))



    if not candidates:

        print("[DEBUG MATCH] Tidak ada kandidat yang cocok.")

        print("[DEBUG MATCH] Struktur data test:")

        print(repr(test))

        return None



    candidates.sort(key=lambda entry: entry[0], reverse=True)

    best_score, best_item = candidates[0]



    print(

        f"[DEBUG MATCH] TERPILIH: {best_item.get('folder')} "

        f"(score={best_score})"

    )



    return best_item



def extract_steps(manifest):

    """Extract step records from list or dictionary manifests."""

    if not manifest or not isinstance(manifest, dict):

        return []



    data = manifest.get("data")



    # Manifest berbentuk list langsung

    if isinstance(data, list):

        return data



    if not isinstance(data, dict):

        return []



    # Manifest berbentuk dictionary dengan daftar steps

    for key in (

        "steps",

        "evidence",

        "stepEvidence",

        "step_evidence",

        "testSteps",

    ):

        value = data.get(key)

        if isinstance(value, list):

            return value



    # Manifest ternyata berisi satu step

    if any(

        key in data

        for key in (

            "screenshot",

            "screenshotPath",

            "screenshot_path",

            "stepName",

            "step",

        )

    ):

        return [data]



    return []


def resolve_screenshot(step, manifest):
    """Resolve screenshot paths on both Windows and Linux."""

    if not isinstance(step, dict):
        return None

    raw_path = (
        step.get("screenshot")
        or step.get("screenshotPath")
        or step.get("screenshot_path")
        or step.get("image")
        or step.get("path")
        or step.get("file")
    )

    if not isinstance(raw_path, str) or not raw_path.strip():
        return None

    # Normalize Windows and Linux path separators.
    normalized_path = raw_path.strip().replace("\\", "/")
    path = Path(normalized_path)

    candidates = [path]

    # Find the path relative to test-results, even when the
    # original absolute path belongs to another machine.
    parts = path.parts

    for index, part in enumerate(parts):
        if part.lower() == "test-results":
            relative = Path(*parts[index:])

            candidates.append(PROJECT_DIR / relative)

            try:
                candidates.append(
                    TEST_RESULTS_DIR / relative.relative_to("test-results")
                )
            except ValueError:
                pass

            break

    candidates.extend([
        PROJECT_DIR / path,
        TEST_RESULTS_DIR / path,
    ])

    # Also try paths relative to the manifest location.
    if isinstance(manifest, dict):
        manifest_path = manifest.get("path")

        if manifest_path:
            manifest_dir = Path(manifest_path).parent

            candidates.extend([
                manifest_dir / path,
                manifest_dir.parent / path,
            ])

    # Remove duplicate candidates and return the first existing file.
    seen = set()

    for candidate in candidates:
        try:
            candidate_key = str(candidate)

            if candidate_key in seen:
                continue

            seen.add(candidate_key)

            if candidate.exists() and candidate.is_file():
                return candidate.resolve()

        except (OSError, ValueError):
            continue

    return None






def step_name(step, index):

    """Return a readable step name without the 'Step 1' prefix."""

    if isinstance(step, str):

        name = Path(step).stem

    else:

        name = ""



        for key in (

            "name",

            "title",

            "stepName",

            "step",

            "description",

            "action",

        ):

            value = step.get(key)

            if isinstance(value, str) and value.strip():

                name = value.strip()

                break



    name = re.sub(r"^\s*step\s*\d+\s*[:.-]?\s*", "", name, flags=re.I)

    return name.strip() or f"Test action {index}"





def step_status(step):

    if not isinstance(step, dict):

        return ""



    value = (

        step.get("status")

        or step.get("result")

        or step.get("outcome")

        or ""

    )



    if isinstance(value, str):

        return value.upper()



    return ""







def step_details(step):

    if not isinstance(step, dict):

        return ""



    for key in ("details", "message", "description", "error"):

        value = step.get(key)

        if isinstance(value, str) and value.strip():

            return value.strip()



    return ""





# ============================================================

# REPORT STYLES

# ============================================================




def build_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="ReportTitleCustom",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=23,
        leading=29,
        alignment=TA_CENTER,
        spaceAfter=18,
    ))

    styles.add(ParagraphStyle(
        name="ReportSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#555555"),
    ))

    styles.add(ParagraphStyle(
        name="SectionHeadingCustom",
        parent=styles["Heading1"],
        fontSize=17,
        leading=22,
        spaceAfter=16,
        keepWithNext=True,
    ))

    styles.add(ParagraphStyle(
        name="StepHeading",
        parent=styles["Heading1"],
        fontSize=17,
        leading=22,
        spaceAfter=12,
        keepWithNext=True,
    ))

    styles.add(ParagraphStyle(
        name="BodyCustom",
        parent=styles["BodyText"],
        fontSize=9,
        leading=13,
        spaceAfter=7,
    ))

    styles.add(ParagraphStyle(
        name="SmallCustom",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#555555"),
    ))

    styles.add(ParagraphStyle(
        name="TOCEntryCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=17,
        leftIndent=0,
        firstLineIndent=0,
        rightIndent=0,
        spaceBefore=3,
        spaceAfter=3,
        textColor=colors.HexColor("#222222"),
    ))

    styles.add(ParagraphStyle(
        name="StatusCustom",
        parent=styles["BodyText"],
        fontSize=10,
        leading=14,
        spaceAfter=8,
    ))

    styles.add(ParagraphStyle(
        name="TestCaseHeading",
        parent=styles["Heading1"],
        fontSize=16,
        leading=21,
        spaceAfter=12,
        keepWithNext=True,
    ))

    return styles




# ============================================================

# PDF DOCUMENT WITH CLICKABLE TABLE OF CONTENTS

# ============================================================



class EvidenceDocument(BaseDocTemplate):

    def __init__(self, filename, **kwargs):

        super().__init__(filename, **kwargs)

        self._bookmark_counter = 0



        frame = Frame(

            LEFT_MARGIN,

            BOTTOM_MARGIN,

            PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN,

            PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN,

            id="normal",

            leftPadding=0,

            rightPadding=0,

            topPadding=0,

            bottomPadding=0,

        )



        self.addPageTemplates([

            PageTemplate(

                id="main",

                frames=[frame],

                onPage=self.draw_page_footer,

            )

        ])



    def beforeDocument(self):
        """Reset bookmark numbering on every multiBuild pass."""
        self._bookmark_counter = 0

    def draw_page_footer(self, canvas, doc):

        canvas.saveState()



        canvas.setStrokeColor(colors.HexColor("#DDDDDD"))

        canvas.setLineWidth(0.5)

        canvas.line(

            LEFT_MARGIN,

            1.35 * cm,

            PAGE_WIDTH - RIGHT_MARGIN,

            1.35 * cm,

        )



        canvas.setFont("Helvetica", 8)

        canvas.setFillColor(colors.HexColor("#555555"))



        canvas.drawString(

            LEFT_MARGIN,

            0.95 * cm,

            TESTER_NAME,

        )



        canvas.drawRightString(

            PAGE_WIDTH - RIGHT_MARGIN,

            0.95 * cm,

            f"Page {doc.page}",

        )



        canvas.restoreState()



    def afterFlowable(self, flowable):
        if getattr(flowable, "style", None) is None:
            return

        if flowable.style.name not in (
            "TestCaseHeading",
            "StepHeading",
        ):
            return

        self._bookmark_counter += 1
        key = f"section-{self._bookmark_counter}"

        title = flowable.getPlainText()

        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(
            title,
            key,
            level=0,
            closed=False,
        )

        self.notify(
            "TOCEntry",
            (0, title, self.page, key),
        )



# ============================================================

# BUILD ONE PDF FOR ONE TEST CASE

# ============================================================



def make_pdf(tests, manifests, output, styles):
    doc = EvidenceDocument(
        str(output),
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN,
        title=Path(tests[0]["test_file"]).name,
        author=TESTER_NAME,
    )

    story = []
    evidence_by_test = []

    # Cari manifest yang sesuai untuk masing-masing test case.
    for test in tests:
        manifest = match_manifest(test, manifests)
        steps = extract_steps(manifest) if manifest else []

        evidence_by_test.append({
            "test": test,
            "manifest": manifest,
            "steps": steps,
        })

        print(
            f"[DEBUG] Test: {test['title']} | "
            f"Steps: {len(steps)} | "
            f"Manifest: {manifest.get('path') if manifest else None}"
        )

    total_steps = sum(
        len(item["steps"]) for item in evidence_by_test
    )

    passed = sum(
        1 for test in tests
        if str(test["status"]).lower() == "passed"
    )

    failed = sum(
        1 for test in tests
        if str(test["status"]).lower() in (
            "failed",
            "timedout",
            "interrupted",
        )
    )

    # --------------------------------------------------------
    # COVER PAGE
    # --------------------------------------------------------

    spec_name = Path(tests[0]["test_file"]).name

    story.append(Spacer(1, 3 * cm))
    story.append(Paragraph(
        "Playwright Test Evidence",
        styles["ReportTitleCustom"],
    ))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(
        clean_text(spec_name),
        styles["SectionHeadingCustom"],
    ))
    story.append(Spacer(1, 0.5 * cm))

    total_duration = sum(
        float(test.get("duration") or 0)
        for test in tests
    )

    summary_data = [
        ["Tester", TESTER_NAME],
        ["Spec File", spec_name],
        ["Total Test Cases", str(len(tests))],
        ["Passed", str(passed)],
        ["Failed", str(failed)],
        ["Total Steps", str(total_steps)],
        ["Total Duration", format_duration(total_duration)],
        ["Generated", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
    ]

    summary_table = Table(
        summary_data,
        colWidths=[4 * cm, 10.5 * cm],
        hAlign="CENTER",
    )

    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F0F0F0")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#222222")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))

    story.append(summary_table)

    # Ringkasan status setiap test case pada cover.
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph(
        "Ringkasan Test Case",
        styles["Heading2"],
    ))

    case_data = [["No.", "Test Case", "Status", "Duration"]]

    for index, test in enumerate(tests, 1):
        case_data.append([
            str(index),
            Paragraph(clean_text(test["title"]), styles["SmallCustom"]),
            str(test["status"]).upper(),
            format_duration(test["duration"]),
        ])

    case_table = Table(
        case_data,
        colWidths=[1 * cm, 8 * cm, 2.5 * cm, 3 * cm],
        repeatRows=1,
        hAlign="CENTER",
    )

    case_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8E8E8")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))

    story.append(case_table)

    # --------------------------------------------------------
    # TABLE OF CONTENTS
    # --------------------------------------------------------

    story.append(PageBreak())
    story.append(Paragraph(
        "DAFTAR ISI",
        styles["SectionHeadingCustom"],
    ))

    toc = TableOfContents()
    toc.levelStyles = [styles["TOCEntryCustom"]]
    toc.dotsMinLevel = 0
    story.append(toc)

    # --------------------------------------------------------
    # TEST CASES + STEP EVIDENCE
    # --------------------------------------------------------

    for case_index, item in enumerate(evidence_by_test, 1):
        test = item["test"]
        manifest = item["manifest"]
        steps = item["steps"]

        # Setiap test case dimulai pada halaman baru.
        story.append(PageBreak())

        story.append(Paragraph(
            f"Test Case {case_index}: {clean_text(test['title'])}",
            styles["TestCaseHeading"],
        ))

        story.append(Paragraph(
            f"<b>Status:</b> {clean_text(str(test['status']).upper())}",
            styles["StatusCustom"],
        ))

        story.append(Paragraph(
            f"<b>Duration:</b> {format_duration(test['duration'])}",
            styles["StatusCustom"],
        ))

        story.append(Paragraph(
            f"<b>Total Steps:</b> {len(steps)}",
            styles["StatusCustom"],
        ))

        if test.get("errors"):
            story.append(Spacer(1, 0.3 * cm))
            story.append(Paragraph(
                "Test Error",
                styles["Heading2"],
            ))

            for error in test["errors"]:
                story.append(Paragraph(
                    clean_text(error).replace("\n", "<br/>"),
                    styles["BodyCustom"],
                ))

        if not steps:
            story.append(Spacer(1, 0.5 * cm))
            story.append(Paragraph(
                "Step evidence tidak ditemukan untuk test case ini.",
                styles["BodyCustom"],
            ))
            continue

        for step_index, step in enumerate(steps, 1):
            # Satu step per halaman.
            story.append(PageBreak())

            name = step_name(step, step_index)

            story.append(Paragraph(
                f"{case_index}.{step_index}. {clean_text(name)}",
                styles["StepHeading"],
            ))

            status_text = step_status(step)
            if status_text:
                story.append(Paragraph(
                    f"<b>Status:</b> {clean_text(status_text)}",
                    styles["StatusCustom"],
                ))

            details = step_details(step)
            if details:
                story.append(Paragraph(
                    f"<b>Detail:</b> "
                    f"{clean_text(details).replace(chr(10), '<br/>')}",
                    styles["BodyCustom"],
                ))

            screenshot = resolve_screenshot(step, manifest)

            if screenshot:
                try:
                    image = Image(str(screenshot))

                    max_width = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN
                    max_height = (
                        PAGE_HEIGHT
                        - TOP_MARGIN
                        - BOTTOM_MARGIN
                        - 5 * cm
                    )

                    scale = min(
                        max_width / image.imageWidth,
                        max_height / image.imageHeight,
                        1.0,
                    )

                    image.drawWidth = image.imageWidth * scale
                    image.drawHeight = image.imageHeight * scale

                    story.append(Spacer(1, 0.3 * cm))
                    story.append(image)

                except Exception as exc:
                    story.append(Paragraph(
                        f"Screenshot gagal ditampilkan: {clean_text(exc)}",
                        styles["SmallCustom"],
                    ))
            else:
                story.append(Paragraph(
                    "Screenshot tidak ditemukan untuk step ini.",
                    styles["SmallCustom"],
                ))

    # ReportLab akan menghitung nomor halaman TOC dan tautan.
    doc.multiBuild(story)


# ============================================================

# MAIN

# ============================================================



def main():
    if not JSON_REPORT.exists():
        print(f"[ERROR] JSON report tidak ditemukan: {JSON_REPORT}")
        print("Jalankan npx playwright test terlebih dahulu.")
        return 1

    try:
        with JSON_REPORT.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except Exception as exc:
        print(f"[ERROR] Gagal membaca JSON report: {exc}")
        return 1

    tests = flatten_suites(data.get("suites") or [])

    if not tests:
        print("[WARN] Tidak ada test case ditemukan di JSON report.")
        return 1

    requested_file = (
        __import__("os").environ.get("PLAYWRIGHT_TEST_FILE", "").strip()
    )

    if requested_file:
        requested_name = Path(requested_file).stem.lower()
        tests = [
            test for test in tests
            if Path(test["test_file"]).stem.lower() == requested_name
        ]

        if not tests:
            print(
                f"[WARN] Tidak ada test ditemukan untuk file: {requested_file}"
            )
            return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    manifests = read_manifests()
    styles = build_styles()
    run_stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Kelompokkan seluruh test berdasarkan file spec.
    grouped_tests = {}

    for test in tests:
        test_file = test.get("test_file") or "UnknownTest.spec.js"
        spec_name = Path(test_file).name
        grouped_tests.setdefault(spec_name, []).append(test)

    print(f"Test cases ditemukan: {len(tests)}")
    print(f"File spec ditemukan: {len(grouped_tests)}")
    print(f"Evidence manifests ditemukan: {len(manifests)}")
    print(f"Folder output: {OUTPUT_DIR}")

    generated = 0

    for spec_name, spec_tests in grouped_tests.items():
        spec_stem = Path(spec_name).stem
        output = OUTPUT_DIR / (
            f"{safe_filename(spec_stem)}_{run_stamp}.pdf"
        )

        try:
            make_pdf(
                spec_tests,
                manifests,
                output,
                styles,
            )

            generated += 1
            print(f"[PDF] {output.relative_to(PROJECT_DIR)}")

        except Exception as exc:
            print(
                f"[ERROR] Gagal membuat PDF untuk "
                f"'{spec_name}': {exc}"
            )

    print(
        f"\nSelesai. PDF berhasil dibuat: "
        f"{generated}/{len(grouped_tests)} file spec"
    )
    print(f"Folder output: {OUTPUT_DIR}")

    return 0 if generated else 1



if __name__ == "__main__":

    sys.exit(main())
