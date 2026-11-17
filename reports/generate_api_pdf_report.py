import json, sys
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Preformatted

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'Reports' / 'API' / 'api-test-details.jsonl'
OUT = ROOT / 'Reports' / 'Individual'
TESTER = 'Irvandi Pransena Hutapea'
NAVY = colors.HexColor('#17324D')
GREEN = colors.HexColor('#18864B')
RED = colors.HexColor('#C0392B')

def load():
    if not DATA.exists():
        raise FileNotFoundError(f'{DATA} not found. Run API tests first.')
    with DATA.open(encoding='utf-8') as f:
        rows = [json.loads(x) for x in f if x.strip()]
    if not rows:
        raise ValueError('API report data is empty.')
    return rows

def make_table(rows, widths, header=False):
    t = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    cmds = [('GRID',(0,0),(-1,-1),.4,colors.HexColor('#D5DDE5')),('VALIGN',(0,0),(-1,-1),'TOP'),
            ('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),
            ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('FONTSIZE',(0,0),(-1,-1),7.5)]
    if header:
        cmds += [('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold')]
    t.setStyle(TableStyle(cmds))
    return t

def main():
    rows = load()
    OUT.mkdir(parents=True, exist_ok=True)
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(name='TitleAPI', parent=s['Title'], fontSize=21, textColor=NAVY, alignment=1, spaceAfter=8))
    s.add(ParagraphStyle(name='HeadAPI', parent=s['Heading2'], fontSize=12, textColor=NAVY, spaceBefore=9, spaceAfter=5))
    s.add(ParagraphStyle(name='CaseAPI', parent=s['Heading1'], fontSize=14, textColor=NAVY))
    s.add(ParagraphStyle(name='CodeAPI', fontName='Courier', fontSize=6.5, leading=8))
    s.add(ParagraphStyle(name='SmallAPI', parent=s['BodyText'], fontSize=7, leading=9))
    passed = sum(all(a.get('passed') for a in r.get('assertions',[])) for r in rows)
    assertions = [a for r in rows for a in r.get('assertions',[])]
    total_ms = sum(int(r.get('responseTimeMs',0)) for r in rows)
    story = [Spacer(1,.5*cm), Paragraph('API TEST EXECUTION REPORT',s['TitleAPI']),
      Paragraph('PRODUCT API TESTING | AUTOMATIONEXERCISE',s['Normal']), Spacer(1,.4*cm),
      Paragraph('EXECUTION SUMMARY',s['HeadAPI']),
      make_table([['Tester',TESTER],['Test Suite','Product API Testing'],
        ['Generated',datetime.now().strftime('%d %B %Y %H:%M:%S')],['Total Test Cases',str(len(rows))],
        ['Passed / Failed',f'{passed} / {len(rows)-passed}'],
        ['Assertions Passed',f'{sum(bool(a.get("passed")) for a in assertions)}/{len(assertions)}'],
        ['Total API Response Time',f'{total_ms/1000:.2f}s']], [4.5*cm,11*cm]),
      Paragraph('TEST CASE OVERVIEW',s['HeadAPI'])]
    overview = [['No.','Test Case','Method','HTTP','Result','Response']]
    for i,r in enumerate(rows,1):
        ok = all(a.get('passed') for a in r.get('assertions',[]))
        overview.append([str(i),Paragraph(escape(r['title']),s['SmallAPI']),r['method'],str(r['httpStatus']),
                         'PASSED' if ok else 'FAILED',f'{r.get("responseTimeMs",0)} ms'])
    story.append(make_table(overview,[.7*cm,6.1*cm,1.4*cm,1.2*cm,1.5*cm,2.5*cm],True))
    for i,r in enumerate(rows,1):
        ok = all(a.get('passed') for a in r.get('assertions',[]))
        color = GREEN if ok else RED
        story += [PageBreak(),Paragraph(f'TEST CASE {i}: {escape(r["title"])}',s['CaseAPI']),
          Paragraph(f'<b>Result:</b> <font color="{color.hexval()}">{"PASSED" if ok else "FAILED"}</font> &nbsp; <b>Response:</b> {r.get("responseTimeMs",0)} ms',s['Normal']),
          Paragraph('1. REQUEST DETAILS',s['HeadAPI']),
          make_table([['Method',r['method']],['Endpoint',r['endpoint']],
            ['Headers',Paragraph(escape(json.dumps(r.get('requestHeaders') or {})),s['CodeAPI'])],
            ['Request Body',Paragraph(escape(json.dumps(r.get('requestBody'),ensure_ascii=False) if r.get('requestBody') is not None else '(empty / none)'),s['CodeAPI'])]],[4*cm,11.5*cm]),
          Paragraph('2. RESPONSE DETAILS',s['HeadAPI']),
          make_table([['HTTP Status',f'{r.get("httpStatus")} {escape(str(r.get("statusText", "")))}'],
            ['Response Time',f'{r.get("responseTimeMs",0)} ms'],['Summary',escape(str(r.get('summary','')))]],[4*cm,11.5*cm]),
          Paragraph('3. ASSERTION / VALIDATION RESULTS',s['HeadAPI'])]
        checks = [['Validation','Expected','Actual','Result']]
        for a in r.get('assertions',[]):
            checks.append([Paragraph(escape(str(a['name'])),s['SmallAPI']),Paragraph(escape(str(a['expected'])),s['SmallAPI']),
              Paragraph(escape(str(a['actual'])),s['SmallAPI']),'PASS' if a.get('passed') else 'FAIL'])
        story += [make_table(checks,[5*cm,3*cm,5*cm,1.5*cm],True),
          Paragraph('4. RESPONSE BODY (JSON)',s['HeadAPI']),
          Preformatted(json.dumps(r.get('responseBody',{}),indent=2,ensure_ascii=False,default=str)[:7000],s['CodeAPI'],maxLineLength=110)]
    output = OUT / f'API_ProductApiTest_{datetime.now():%Y%m%d_%H%M%S}.pdf'
    def footer(canvas,doc):
        canvas.saveState()
        w,h=A4
        canvas.setStrokeColor(colors.HexColor('#D5DDE5'))
        canvas.line(1.6*cm,1.3*cm,w-1.6*cm,1.3*cm)
        canvas.setFont('Helvetica',7)
        canvas.setFillColor(colors.HexColor('#65717C'))
        canvas.drawString(1.6*cm,.9*cm,'Tester: '+TESTER)
        canvas.drawRightString(w-1.6*cm,.9*cm,f'API Test Report | Page {doc.page}')
        canvas.restoreState()
    doc = SimpleDocTemplate(str(output),pagesize=A4,leftMargin=1.6*cm,rightMargin=1.6*cm,topMargin=1.5*cm,bottomMargin=1.7*cm)
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    print(f'[API PDF] Created: {output}')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'[API PDF ERROR] {e}')
        sys.exit(1)
