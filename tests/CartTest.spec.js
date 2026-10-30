
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { ProductPage } from '../pages/ProductPage.js';
import { CartPage } from '../pages/CartPage.js';
import { TestData } from '../utils/TestData.js';
import { reportStep } from '../utils/StepReporter.js';

test.describe('Cart', () => {
  const data = TestData.cart[0];

  async function addProductToCart(page, testInfo) {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await reportStep(page, testInfo, 'Open home page', async () => {
      await home.open();
    });

    await reportStep(page, testInfo, 'Open products page', async () => {
      // Buka halaman Products sebelum mencari produk.
      await page.goto('/products');
      await expect(page).toHaveURL(/\/products/);
    });

    await reportStep(page, testInfo, 'Search product', async () => {
      await product.searchProduct(data.searchProduct);
    });

    await reportStep(page, testInfo, 'Add product to cart', async () => {
      await product.addFirstProductToCart();
    });

    await reportStep(page, testInfo, 'Open cart page', async () => {
      await cart.open();
    });

    return cart;
  }

  test('Verify product appears in cart', async ({ page }, testInfo) => {
    const cart = await addProductToCart(page, testInfo);

    await reportStep(page, testInfo, 'Verify product in cart', async () => {
      const names = await cart.getProductNames();

      expect(
        names.some(name =>
          name.trim().includes(data.expectedProduct)
        )
      ).toBeTruthy();
    });
  });

  test('Verify cart row count', async ({ page }, testInfo) => {
    const cart = await addProductToCart(page, testInfo);

    await reportStep(page, testInfo, 'Verify cart row count', async () => {
      await expect.poll(
        async () => await cart.getRowCount()
      ).toBe(Number(data.expectedRowCount));
    });
  });

  test('Remove first product from cart', async ({ page }, testInfo) => {
    const cart = await addProductToCart(page, testInfo);

    await reportStep(page, testInfo, 'Verify product exists', async () => {
      expect(await cart.getRowCount()).toBeGreaterThan(0);
    });

    await reportStep(page, testInfo, 'Remove first product', async () => {
      await cart.removeFirstProduct();
    });

    await reportStep(page, testInfo, 'Verify product removed', async () => {
      await expect.poll(
        async () => await cart.getRowCount()
      ).toBe(Number(data.expectedRemainingCount));
    });
  });
});
