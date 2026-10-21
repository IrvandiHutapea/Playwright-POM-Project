
import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const resultsPath = path.resolve('Reports/playwright-results.json');
const outputPath = path.resolve('Reports/Playwright-Test-Report.pdf');

function flattenSuite(suite, parent = '') {
  const result = [];

  const currentTitle = [parent, suite.title]
    .filter(Boolean)
    .join(' > ');

  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const lastResult =
        test.results?.[test.results.length - 1];

      result.push({
        title: [currentTitle, spec.title]
          .filter(Boolean)
          .join(' > '),
        status: lastResult?.status || test.status || 'unknown',
        duration: lastResult?.duration || 0,
        error: lastResult?.error?.message || '',
      });
    }
  }

  for (const child of suite.suites || []) {
    result.push(...flattenSuite(child, currentTitle));
  }

  return result;
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/[^\x20-\x7E]/g, ' ');
}

async function generatePDF() {
  if (!fs.existsSync(resultsPath)) {
    throw new Error(
      `JSON report belum ditemukan: ${resultsPath}`
    );
  }

  const data = JSON.parse(
    fs.readFileSync(resultsPath, 'utf8')
  );

  const rows = [];

  for (const suite of data.suites || []) {
    rows.push(...flattenSuite(suite));
  }

  const passed = rows.filter(
    row => row.status === 'passed'
  ).length;

  const failed = rows.filter(
    row => row.status === 'failed'
  ).length;

  const skipped = rows.filter(
    row =>
      row.status === 'skipped' ||
      row.status === 'pending'
  ).length;

  const total = rows.length;

  const pdf = await PDFDocument.create();

  const font = await pdf.embedFont(
    StandardFonts.Helvetica
  );

  const bold = await pdf.embedFont(
    StandardFonts.HelveticaBold
  );

  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 40;

  let page;
  let y;

  function newPage() {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  function draw(
    text,
    x = margin,
    size = 10,
    selectedFont = font,
    color = rgb(0.1, 0.1, 0.1)
  ) {
    page.drawText(cleanText(text), {
      x,
      y,
      size,
      font: selectedFont,
      color,
      maxWidth: pageWidth - x - margin,
    });
  }

  function ensureSpace(required = 20) {
    if (y - required < margin) {
      newPage();
    }
  }

  newPage();

  // TITLE
  draw('Playwright Automation Test Report', margin, 20, bold);
  y -= 30;

  draw(`Generated: ${new Date().toLocaleString()}`, margin, 9);
  y -= 30;

  // SUMMARY
  draw('Test Summary', margin, 13, bold);
  y -= 22;

  draw(`Total: ${total}`, margin, 10, bold);
  draw(`Passed: ${passed}`, 140, 10);
  draw(`Failed: ${failed}`, 240, 10);
  draw(`Skipped: ${skipped}`, 340, 10);

  y -= 25;

  const passRate =
    total > 0
      ? ((passed / total) * 100).toFixed(1)
      : '0.0';

  draw(`Pass Rate: ${passRate}%`, margin, 10);
  y -= 35;

  // TEST RESULTS HEADER
  draw('Test Results', margin, 13, bold);
  y -= 25;

  draw('No.', margin, 9, bold);
  draw('Test Case', 75, 9, bold);
  draw('Status', 600, 9, bold);
  draw('Duration', 690, 9, bold);

  y -= 18;

  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.8,
    color: rgb(0.65, 0.65, 0.65),
  });

  y -= 15;

  // TEST RESULTS
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ensureSpace(row.error && row.status === 'failed' ? 45 : 25);

    const title = cleanText(row.title);
    const status = String(row.status).toUpperCase();

    draw(String(i + 1), margin, 8);
    draw(title, 75, 8);

    const statusColor =
      row.status === 'passed'
        ? rgb(0, 0.45, 0.15)
        : row.status === 'failed'
          ? rgb(0.8, 0.1, 0.1)
          : rgb(0.45, 0.45, 0.45);

    draw(status, 600, 8, bold, statusColor);
    draw(`${row.duration} ms`, 690, 8);

    y -= 18;

    if (row.error && row.status === 'failed') {
      const errorLines = cleanText(row.error).match(/.{1,100}/g) || [];

      draw('Error:', 75, 8, bold);
      y -= 13;

      for (const line of errorLines.slice(0, 3)) {
        ensureSpace(15);
        draw(line, 85, 7);
        y -= 12;
      }
    }

    y -= 5;
  }

  // FINAL SUMMARY
  ensureSpace(60);
  y -= 10;

  draw('Execution Summary', margin, 13, bold);
  y -= 22;

  draw(`Total test cases: ${total}`, margin, 10);
  y -= 16;

  draw(`Passed: ${passed}`, margin, 10);
  y -= 16;

  draw(`Failed: ${failed}`, margin, 10);
  y -= 16;

  draw(`Skipped: ${skipped}`, margin, 10);

  // PAGE NUMBERS
  const pages = pdf.getPages();

  pages.forEach((pdfPage, index) => {
    pdfPage.drawText(
      `Page ${index + 1} of ${pages.length}`,
      {
        x: pageWidth - 110,
        y: 20,
        size: 8,
        font,
        color: rgb(0.4, 0.4, 0.4),
      }
    );
  });

  // SAVE PDF
  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true,
  });

  const pdfBytes = await pdf.save();

  fs.writeFileSync(outputPath, pdfBytes);

  console.log('\n======================================');
  console.log('PDF REPORT BERHASIL DIBUAT');
  console.log(outputPath);
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
  console.log('======================================\n');
}

generatePDF().catch(error => {
  console.error('\nGAGAL MEMBUAT PDF REPORT');
  console.error(error);
  process.exitCode = 1;
});
