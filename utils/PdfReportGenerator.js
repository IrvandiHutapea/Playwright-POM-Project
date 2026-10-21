import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(currentDir, '..');

class PdfReportReporter {
  async onEnd() {
    console.log('\nGenerating PDF reports...');

    const scriptPath = path.join(
      projectDir,
      'reports',
      'generate_pdf_report.py'
    );

    const result = spawnSync(
      'python',
      [scriptPath],
      {
        cwd: projectDir,
        stdio: 'inherit',
      }
    );

    if (result.error) {
      console.error('Gagal menjalankan Python:', result.error.message);
    } else if (result.status !== 0) {
      console.error('PDF generator gagal dijalankan.');
    }
  }
}

export default PdfReportReporter;