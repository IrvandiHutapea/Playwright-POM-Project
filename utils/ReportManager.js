import fs from 'node:fs';
import path from 'node:path';

export class ReportManager {
  static reportDir = null;
  static currentTest = null;

  static initReport() {
    const date = new Date().toISOString().slice(0, 10);
    this.reportDir = path.resolve('Reports', date);
    fs.mkdirSync(this.reportDir, { recursive: true });
    this.currentTest = null;
  }

  static startTest(testName) {
    if (!this.reportDir) {
      this.initReport();
    }

    this.currentTest = {
      testName,
      startTime: new Date().toISOString(),
      steps: []
    };
  }

  static logStep(message, status = 'INFO') {
    if (!this.currentTest) {
      throw new Error('startTest belum dipanggil. Panggil ReportManager.startTest() terlebih dahulu.');
    }

    this.currentTest.steps.push({
      time: new Date().toISOString(),
      status,
      message
    });
  }

  static endTesting(status = 'PASSED') {
    if (!this.currentTest) {
      throw new Error('Tidak ada test aktif. Panggil startTest() terlebih dahulu.');
    }

    this.currentTest.endTime = new Date().toISOString();
    this.currentTest.status = status;

    const safeName = this.currentTest.testName.replace(/[^a-z0-9-_]/gi, '_');
    const filePath = path.join(this.reportDir, `${safeName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(this.currentTest, null, 2));

    this.currentTest = null;
  }
}