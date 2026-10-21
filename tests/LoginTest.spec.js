import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { Login } from '../pages/Login.js';
import { TestData } from '../utils/TestData.js';
import { reportStep } from '../utils/StepReporter.js';

test.describe('Login', () => {
  test('Positive login - valid credentials', async ({ page }, testInfo) => {
    const home = new HomePage(page);
    const login = new Login(page);

    // STEP 1: Open home page
    await reportStep(page, testInfo, 'Open home page', async () => {
      await home.open();
    });

    // STEP 2: Open login page
    await reportStep(page, testInfo, 'Open login page', async () => {
      await home.openLogin();
    });

    // STEP 3: Verify login page
    await reportStep(page, testInfo, 'Verify login page is displayed', async () => {
      await expect(
        page.locator(login.locator.loginTitle)
      ).toBeVisible();
    });

    // STEP 4: Enter valid email and password
    await reportStep(page, testInfo, 'Enter valid login credentials', async () => {
      await login.loginWithData(TestData.validLogin);
    });

    // STEP 5: Verify login success
    await reportStep(page, testInfo, 'Verify successful login', async () => {
      await expect(
        page.locator('a:has-text("Logged in as")')
      ).toBeVisible();
    });
  });
});