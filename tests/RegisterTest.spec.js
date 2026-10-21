import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { generateUser } from '../utils/TestData.js';
import { reportStep } from '../utils/StepReporter.js';

test('Register new account', async ({ page }, testInfo) => {
  const home = new HomePage(page);
  const register = new RegisterPage(page);
  const user = generateUser();

  await reportStep(page, testInfo, 'Open home page', async () => {
    await home.open();
  });

  await reportStep(page, testInfo, 'Open login and signup page', async () => {
    await home.openLogin();
  });

  await reportStep(page, testInfo, 'Enter new account signup details', async () => {
    await register.startSignup(user.name, user.email);
  });

  await reportStep(page, testInfo, 'Verify account information page', async () => {
    await expect(
      page.locator('text=Enter Account Information')
    ).toBeVisible();
  });

  await reportStep(page, testInfo, 'Fill account information', async () => {
    await register.fillAccountDetails(user);
  });

  await reportStep(page, testInfo, 'Verify account creation success', async () => {
    await expect(
      page.locator(register.locator.accountCreatedText)
    ).toBeVisible();
  });

  await reportStep(page, testInfo, 'Continue after account creation', async () => {
    await register.continue();
  });

  await reportStep(page, testInfo, 'Verify logged-in status', async () => {
    await expect(
      page.locator('a:has-text("Logged in as")')
    ).toBeVisible();
  });
});