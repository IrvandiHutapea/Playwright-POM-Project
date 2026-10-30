
import { test, expect } from '@playwright/test';
import { ContactUsPage } from '../pages/ContactUsPage.js';
import { TestData } from '../utils/TestData.js';
import { reportStep } from '../utils/StepReporter.js';
import fs from 'node:fs/promises';

test('Contact Us form with file upload', async ({ page }, testInfo) => {
  const contact = new ContactUsPage(page);
  const contactData = TestData.contact[0];

  const uploadFilePath = testInfo.outputPath('contact-us-upload.txt');

  await fs.writeFile(
    uploadFilePath,
    'Sample attachment for Playwright Contact Us test.'
  );

  // STEP 1: Open Contact Us page
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

  // STEP 2: Fill contact form using Excel data
  await reportStep(
    page,
    testInfo,
    'Step 2 - Fill contact form',
    async () => {
      await contact.fillForm(contactData);

      await expect(
        page.locator('[data-qa="name"]')
      ).toHaveValue(contactData.name);

      await expect(
        page.locator('[data-qa="email"]')
      ).toHaveValue(contactData.email);

      await expect(
        page.locator('[data-qa="subject"]')
      ).toHaveValue(contactData.subject);

      await expect(
        page.locator('[data-qa="message"]')
      ).toHaveValue(contactData.message);
    }
  );

  // STEP 3: Upload attachment
  await reportStep(
    page,
    testInfo,
    'Step 3 - Upload attachment',
    async () => {
      await contact.uploadFile(uploadFilePath);

      await expect(
        page.locator('input[name="upload_file"]')
      ).toHaveValue(/contact-us-upload\.txt/);
    }
  );

  // STEP 4: Submit contact form
  await reportStep(
    page,
    testInfo,
    'Step 4 - Submit contact form',
    async () => {
      await contact.submit();

      const successMessage = page.locator(
        '#contact-page .status.alert-success'
      );

      await expect(successMessage).toBeVisible({
        timeout: 15000,
      });

      await expect(successMessage).toContainText(
        'Success! Your details have been submitted successfully.'
      );
    }
  );

  // STEP 5: Verify successful submission
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
