
import { ProductLocator } from '../locators/ProductLocator.js';

export class ProductPage {
  constructor(page) {
    this.page = page;
    this.locator = new ProductLocator();
  }

  async open() {
    await this.page.locator(this.locator.productsLink).first().click();
    await this.page.waitForURL(/\/products/);
  }

  async searchProduct(productName) {
    await this.page.locator(this.locator.searchInput).fill(productName);
    await this.page.locator(this.locator.searchButton).click();
  }

  async getProductNames() {
    return await this.page
      .locator(this.locator.productNames)
      .allTextContents();
  }

  async closeCartModal() {
    const modal = this.page.locator('#cartModal');

    await modal.waitFor({ state: 'visible' });

    const continueButton = modal.getByRole('button', {
      name: /continue shopping/i
    });

    await continueButton.click();
    await modal.waitFor({ state: 'hidden' });
  }

  async addProductToCart(productName) {
    const product = this.page
      .locator(this.locator.productCards)
      .filter({
        has: this.page.locator('.productinfo p', {
          hasText: productName
        })
      })
      .first();

    const addToCartButton = product.locator('a.add-to-cart');

    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click();

    await this.closeCartModal();
  }

  async addFirstProductToCart() {
    const addToCartButton = this.page
      .locator(this.locator.addToCartButtons)
      .first();

    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click();

    await this.closeCartModal();
  }

  async viewCart() {
    const modal = this.page.locator('#cartModal');

    // Tutup modal Add to Cart jika masih terbuka
    if (await modal.isVisible()) {
      const continueShopping = modal.getByRole('button', {
        name: /continue shopping/i,
      });

      await continueShopping.click();
      await modal.waitFor({ state: 'hidden' });
    }

    // Buka Cart melalui navigasi header
    const cartLink = this.page.locator('header a[href="/view_cart"]');

    await cartLink.click();
    await this.page.waitForURL(/\/view_cart/);
  }
}
