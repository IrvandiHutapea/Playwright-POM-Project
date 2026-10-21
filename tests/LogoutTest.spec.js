
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { generateUser } from '../utils/TestData.js';
import { reportStep } from '../utils/StepReporter.js';

test('Register, then logout', async ({ page }, testInfo) => {
  const home = new HomePage(page);
  const register = new RegisterPage(page);
  const user = generateUser();

  // STEP 1: Open home page
  await reportStep(
    page,
    testInfo,
    'Step 1 - Open home page',
    async () => {
      await home.open();
    }
  );

  // STEP 2: Open login and signup page
  await reportStep(
    page,
    testInfo,
    'Step 2 - Open login and signup page',
    async () => {
      await home.openLogin();
    }
  );

  // STEP 3: Enter signup details
  await reportStep(
    page,
    testInfo,
    'Step 3 - Enter signup name and email',
    async () => {
      await register.startSignup(user.name, user.email);
    }
  );

  // STEP 4: Verify account information page
  await reportStep(
    page,
    testInfo,
    'Step 4 - Verify account information page',
    async () => {
      await expect(
        page.locator('text=Enter Account Information')
      ).toBeVisible();
    }
  );

  // STEP 5: Fill account details
  await reportStep(
    page,
    testInfo,
    'Step 5 - Fill account details',
    async () => {
      await register.fillAccountDetails(user);
    }
  );

  // STEP 6: Verify account created
  await reportStep(
    page,
    testInfo,
    'Step 6 - Verify account created',
    async () => {
      await expect(
        page.locator(register.locator.accountCreatedText)
      ).toBeVisible();
    }
  );

  // STEP 7: Continue after registration
  await reportStep(
    page,
    testInfo,
    'Step 7 - Continue after registration',
    async () => {
      await register.continue();
    }
  );

  // STEP 8: Verify logged-in status
  await reportStep(
    page,
    testInfo,
    'Step 8 - Verify logged-in status',
    async () => {
      await expect(
        page.locator('a:has-text("Logged in as")')
      ).toBeVisible();
    }
  );

  // STEP 9: Logout
  await reportStep(
    page,
    testInfo,
    'Step 9 - Logout',
    async () => {
      await home.logout();
    }
  );

  // STEP 10: Verify redirected to login page
  await reportStep(
    page,
    testInfo,
    'Step 10 - Verify redirected to login page',
    async () => {
      await expect(page).toHaveURL(/\/login/);
    }
  );
});
