
import fs from 'node:fs/promises';

export async function reportStep(page, testInfo, stepName, action) {
  const outputDir = testInfo.outputDir;

  // Setiap test case mempunyai folder evidence sendiri
  const evidenceDir = testInfo.outputPath('step-evidence');
  await fs.mkdir(evidenceDir, { recursive: true });

  const manifestPath = testInfo.outputPath('step-evidence.json');

  let steps = [];
  try {
    steps = JSON.parse(
      await fs.readFile(manifestPath, 'utf8')
    );
  } catch {
    steps = [];
  }

  const stepNumber = steps.length + 1;
  const number = String(stepNumber).padStart(2, '0');
  const screenshotPath = `${evidenceDir}/step-${number}.png`;

  let status = 'PASS';
  let error = '';

  console.log(`\n[STEP ${number}] ${stepName}`);

  try {
    await action();
    console.log(`[PASS] ${stepName}`);
  } catch (err) {
    status = 'FAIL';
    error = String(err?.message || err);
    console.log(`[FAIL] ${stepName}`);
    throw err;
  } finally {
    let screenshot = null;

    try {
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        timeout: 15000
      });

      screenshot = screenshotPath;
    } catch (screenshotError) {
      error += `\nScreenshot error: ${screenshotError.message}`;
    }

    steps.push({
      step: stepNumber,
      name: stepName,
      status,
      screenshot,
      error
    });

    await fs.writeFile(
      manifestPath,
      JSON.stringify(steps, null, 2),
      'utf8'
    );
  }
}
