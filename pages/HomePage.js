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
    await this.page.goto('/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  }

  async openProducts() {
    await this.page.goto('/products', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  }

  async openCart() {
    await this.page.goto('/view_cart', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  }

  async openContactUs() {
    await this.page.goto('/contact_us', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  }

  async logout() {
    await this.page.locator(this.locator.logoutLink).click({
      timeout: 15000
    });
  }

  async isLoggedIn() {
    return await this.page.locator(this.locator.loggedInAs).isVisible();
  }
}