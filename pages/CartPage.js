import { CartLocator } from '../locators/CartLocator.js';

export class CartPage {
  constructor(page) {
    this.page = page;
    this.locator = new CartLocator();
  }

  async open() {
    await this.page.locator(this.locator.cartLink).click();
  }

  async getProductNames() {
    return await this.page.locator(this.locator.productNames).allTextContents();
  }

  async getRowCount() {
    return await this.page.locator(this.locator.cartRows).count();
  }

  async removeFirstProduct() {
    await this.page.locator(this.locator.deleteButtons).first().click();
  }
}