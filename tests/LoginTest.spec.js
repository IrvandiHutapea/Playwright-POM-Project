
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { Login } from '../pages/Login.js';
import { TestData } from '../utils/TestData.js';
import { reportStep } from '../utils/StepReporter.js';

test.describe('Login', () => {
  test('Positive login - valid credentials', async ({ page }, testInfo) => {
    const home = new HomePage(page);
    const login = new Login(page);

    // Ambil kredensial dari Excel
    const user = TestData.validLogin;

    expect(user, 'Valid login data must exist in LoginData.xlsx')
      .toBeTruthy();

    await reportStep(page, testInfo, 'Open home page', async () => {
      await home.open();
    });

    await reportStep(page, testInfo, 'Open login page', async () => {
      await home.openLogin();
    });

    await reportStep(page, testInfo, 'Verify login page is displayed', async () => {
      await expect(
        page.locator(login.locator.loginTitle)
      ).toBeVisible();
    });

    await reportStep(page, testInfo, 'Enter valid login credentials', async () => {
      await login.loginWithData(user);
    });

    await reportStep(page, testInfo, 'Verify successful login', async () => {
      await expect(
        page.locator('a:has-text("Logged in as")')
      ).toBeVisible();
    });
  });
});