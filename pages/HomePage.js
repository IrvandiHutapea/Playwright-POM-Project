import { HomeLocator } from '../locators/HomeLocator.js';

export class HomePage {
  constructor(page) {
    this.page = page;
    this.locator = new HomeLocator();
  }

  async open() {
    await this.page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  }

  async openLogin() {
    await this.page.locator(this.locator.signupLoginLink).click();
  }

  async openProducts() {
    await this.page.locator(this.locator.productsLink).click();
  }

  async openCart() {
    await this.page.locator(this.locator.cartLink).click();
  }

  async openContactUs() {
    await this.page.locator(this.locator.contactUsLink).click();
  }

  async logout() {
    await this.page.locator(this.locator.logoutLink).click();
  }

  async isLoggedIn() {
    return await this.page.locator(this.locator.loggedInAs).isVisible();
  }
}