
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(currentDir, '..');
const scriptPath = path.join(
  projectDir,
  'reports',
  'generate_pdf_report.py'
);

class PdfReportReporter {
  async onEnd() {
    console.log('\n========================================');
    console.log('Generating individual PDF reports...');
    console.log('========================================');

    const commands =
      process.platform === 'win32'
        ? ['python', 'py']
        : ['python3', 'python'];

    let pythonFound = false;

    for (const command of commands) {
      console.log(`\nRunning PDF generator with: ${command}`);

      const result = spawnSync(
        command,
        ['-u', scriptPath],
        {
          cwd: projectDir,
          encoding: 'utf8',
          stdio: 'inherit',
          timeout: 120000,
          windowsHide: true,
        }
      );

      if (result.error) {
        console.error(
          `Could not run "${command}": ${result.error.message}`
        );
        continue;
      }

      pythonFound = true;

      if (result.signal) {
        console.error(
          `PDF generator stopped by signal: ${result.signal}`
        );
        return;
      }

      if (result.status !== 0) {
        console.error(
          `PDF generator failed with exit code: ${result.status}`
        );
        console.error(
          'Check the Python error above and fix generate_pdf_report.py.'
        );
        return;
      }

      console.log('\nPDF generator finished successfully.');
      console.log(
        `Check output folder: ${path.join(projectDir, 'Reports', 'Individual')}`
      );
      return;
    }

    if (!pythonFound) {
      console.error(
        '\nPython could not be started. Check your Python installation and PATH.'
      );
    }
  }
}

export default PdfReportReporter;
