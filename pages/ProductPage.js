import { ProductLocator } from '../locators/ProductLocator.js';

export class ProductPage {
  constructor(page) {
    this.page = page;
    this.locator = new ProductLocator();
  }

  async open() {
    await this.page.locator(this.locator.productsLink).click();
  }

  async searchProduct(productName) {
    await this.page.locator(this.locator.searchInput).fill(productName);
    await this.page.locator(this.locator.searchButton).click();
  }

  async getProductNames() {
    return await this.page.locator(this.locator.productNames).allTextContents();
  }

  async addFirstProductToCart() {
    const addToCartButton = this.page
      .locator(this.locator.addToCartButtons)
      .first();

    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click({ force: true });
  }

  async viewCart() {
    await this.page
      .locator(this.locator.viewCartLink)
      .filter({ hasText: 'View Cart' })
      .click();
  }
}