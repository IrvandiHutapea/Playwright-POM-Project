
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export default class AutoPdfReporter {
  onBegin(config, suite) {
    const testFiles = new Set();

    for (const test of suite.allTests()) {
      testFiles.add(path.basename(test.location.file));
    }

    this.testFiles = [...testFiles];
  }

  async onEnd() {
    const projectDir = process.cwd();
    const scriptPath = path.join(
      projectDir,
      'reports',
      'generate_pdf_report.py'
    );

    for (const testFile of this.testFiles) {
      console.log(`\nGenerating PDF for ${testFile}...`);

      const env = {
        ...process.env,
        PLAYWRIGHT_TEST_FILE: testFile
      };

      const result = spawnSync(
        'python',
        [scriptPath],
        {
          cwd: projectDir,
          encoding: 'utf8',
          stdio: 'inherit',
          env
        }
      );

      if (result.error) {
        console.error(
          `Failed to generate PDF for ${testFile}:`,
          result.error.message
        );
      } else if (result.status !== 0) {
        console.error(
          `PDF generator failed for ${testFile}, exit code ${result.status}`
        );
      }
    }
  }
}
