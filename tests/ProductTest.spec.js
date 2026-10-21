
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { ProductPage } from '../pages/ProductPage.js';
import { CartPage } from '../pages/CartPage.js';
import { reportStep } from '../utils/StepReporter.js';

test.describe('Products and Cart', () => {

  test('Search product', async ({ page }, testInfo) => {
    const home = new HomePage(page);
    const products = new ProductPage(page);

    // STEP 1: Open home page
    await reportStep(
      page,
      testInfo,
      'Step 1 - Open home page',
      async () => {
        await home.open();
      }
    );

    // STEP 2: Open products page
    await reportStep(
      page,
      testInfo,
      'Step 2 - Open products page',
      async () => {
        await products.open();
      }
    );

    // STEP 3: Verify products page
    await reportStep(
      page,
      testInfo,
      'Step 3 - Verify products page is displayed',
      async () => {
        await expect(
          page.locator(products.locator.productsTitle)
        ).toBeVisible();
      }
    );

    // STEP 4: Search for Blue Top
    await reportStep(
      page,
      testInfo,
      'Step 4 - Search for Blue Top',
      async () => {
        await products.searchProduct('Blue Top');
      }
    );

    // STEP 5: Verify search results
    await reportStep(
      page,
      testInfo,
      'Step 5 - Verify search results',
      async () => {
        const names = await products.getProductNames();

        expect(names.length).toBeGreaterThan(0);
        expect(names.join(' ')).toContain('Blue Top');
      }
    );
  });

  test('Add first product to cart', async ({ page }, testInfo) => {
    const home = new HomePage(page);
    const products = new ProductPage(page);
    const cart = new CartPage(page);

    // STEP 1: Open home page
    await reportStep(
      page,
      testInfo,
      'Step 1 - Open home page',
      async () => {
        await home.open();
      }
    );

    // STEP 2: Open products page
    await reportStep(
      page,
      testInfo,
      'Step 2 - Open products page',
      async () => {
        await products.open();
      }
    );

    // STEP 3: Add first product to cart
    await reportStep(
      page,
      testInfo,
      'Step 3 - Add first product to cart',
      async () => {
        await products.addFirstProductToCart();
      }
    );

    // STEP 4: Open cart page
    await reportStep(
      page,
      testInfo,
      'Step 4 - Open cart page',
      async () => {
        await products.viewCart();
      }
    );

    // STEP 5: Verify cart contains a product
    await reportStep(
      page,
      testInfo,
      'Step 5 - Verify product exists in cart',
      async () => {
        expect(await cart.getRowCount()).toBeGreaterThan(0);
      }
    );
  });

});
