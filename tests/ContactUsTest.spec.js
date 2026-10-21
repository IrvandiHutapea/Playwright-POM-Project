
import { test, expect } from '@playwright/test';
import { reportStep } from '../utils/StepReporter.js';
import fs from 'node:fs/promises';

test('Contact Us form with file upload', async ({ page }, testInfo) => {
  // Siapkan file untuk upload
  const uploadFilePath = testInfo.outputPath('contact-us-upload.txt');

  await fs.writeFile(
    uploadFilePath,
    'Sample attachment for Playwright Contact Us test.'
  );

  // STEP 1: Buka halaman Contact Us
  await reportStep(
    page,
    testInfo,
    'Step 1 - Open Contact Us page',
    async () => {
      await page.goto('/contact_us');

      await expect(
        page.getByText('Get In Touch', { exact: true })
      ).toBeVisible();
    }
  );

  // STEP 2: Isi form Contact Us
  await reportStep(
    page,
    testInfo,
    'Step 2 - Fill contact form',
    async () => {
      await page.locator('[data-qa="name"]').fill('Test User');
      await page.locator('[data-qa="email"]').fill('test@example.com');
      await page.locator('[data-qa="subject"]').fill('Automation Test');
      await page.locator('[data-qa="message"]').fill(
        'Test message from Playwright automation.'
      );

      await expect(
        page.locator('[data-qa="name"]')
      ).toHaveValue('Test User');

      await expect(
        page.locator('[data-qa="email"]')
      ).toHaveValue('test@example.com');
    }
  );

  // STEP 3: Upload file
  await reportStep(
    page,
    testInfo,
    'Step 3 - Upload attachment',
    async () => {
      const uploadInput = page.locator('input[name="upload_file"]');

      await uploadInput.setInputFiles(uploadFilePath);

      await expect(uploadInput).toHaveValue(
        /contact-us-upload\.txt/
      );
    }
  );

  // STEP 4: Submit form dan validasi pesan sukses
  await reportStep(
    page,
    testInfo,
    'Step 4 - Submit contact form',
    async () => {
      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await page.locator('[data-qa="submit-button"]').click();

      const successMessage = page.locator(
        '#contact-page .status.alert-success'
      );

      await expect(successMessage).toBeVisible({
        timeout: 15000
      });

      await expect(successMessage).toContainText(
        'Success! Your details have been submitted successfully.'
      );
    }
  );

  // STEP 5: Verifikasi akhir
  await reportStep(
    page,
    testInfo,
    'Step 5 - Verify successful submission',
    async () => {
      const successMessage = page.locator(
        '#contact-page .status.alert-success'
      );

      await expect(successMessage).toBeVisible();

      await expect(successMessage).toContainText(
        'Success! Your details have been submitted successfully.'
      );
    }
  );
});
