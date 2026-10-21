
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
    [
      'json',
      {
        outputFile: 'Reports/playwright-results.json',
      },
    ],
    ['./utils/PdfReportReporter.js'],
  ],

  use: {
    baseURL: 'https://automationexercise.com',

    headless: process.env.HEADLESS !== 'false',

    viewport: {
      width: 1280,
      height: 720,
    },

    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: 60_000,
    navigationTimeout: 60_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
