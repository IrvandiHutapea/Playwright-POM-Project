import { LoginLocator } from '../locators/LoginLocator.js';

export class Login {
  constructor(page) {
    this.page = page;
    this.locator = new LoginLocator();
  }

  async login(email, password) {
    await this.page.locator(this.locator.email).fill(email);
    await this.page.locator(this.locator.password).fill(password);
    await this.page.locator(this.locator.loginButton).click();
  }

  async loginWithData(data) {
    await this.login(data.email, data.password);
  }

  async getErrorMessage() {
    return await this.page.locator(this.locator.errorMessage).textContent();
  }
}