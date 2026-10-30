
import { CartLocator } from '../locators/CartLocator.js';

export class CartPage {
  constructor(page) {
    this.page = page;
    this.locator = new CartLocator();
  }

  async open() {
    // Pastikan modal konfirmasi sudah tertutup
    const modal = this.page.locator('#cartModal');

    if (await modal.isVisible()) {
      await modal.getByRole('button', {
        name: /continue shopping/i
      }).click();

      await modal.waitFor({ state: 'hidden' });
    }

    // Buka Cart dari navbar
    const cartLink = this.page
      .locator('header a[href="/view_cart"]')
      .first();

    await cartLink.click();
    await this.page.waitForURL(/\/view_cart/);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getProductNames() {
    return await this.page
      .locator(this.locator.productNames)
      .allTextContents();
  }

  async getRowCount() {
    return await this.page
      .locator(this.locator.cartRows)
      .count();
  }

  async removeFirstProduct() {
    await this.page
      .locator(this.locator.deleteButtons)
      .first()
      .click();
  }
}
