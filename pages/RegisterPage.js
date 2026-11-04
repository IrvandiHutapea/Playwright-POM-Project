
import { RegisterLocator } from '../locators/RegisterLocator.js';

export class RegisterPage {
  constructor(page) {
    this.page = page;
    this.locator = new RegisterLocator();
  }

  async startSignup(name, email) {
    const signupName = this.page.locator(this.locator.signupName);
    const signupEmail = this.page.locator(this.locator.signupEmail);
    const signupButton = this.page.locator(this.locator.signupButton);

    await signupName.waitFor({
      state: 'visible',
      timeout: 30000
    });

    await signupEmail.waitFor({
      state: 'visible',
      timeout: 15000
    });

    await signupName.fill(name);
    await signupEmail.fill(email);

    await signupButton.click();

    await this.page.locator(
      this.locator.accountInformationText
    ).waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  async fillAccountDetails(data) {
    await this.page.locator(this.locator.titleMr).check();
    await this.page.locator(this.locator.password).fill(data.password);

    await this.page.locator(this.locator.day).selectOption('1');
    await this.page.locator(this.locator.month).selectOption('1');
    await this.page.locator(this.locator.year).selectOption('2000');

    await this.page.locator(this.locator.newsletter).check();
    await this.page.locator(this.locator.offers).check();

    await this.page.locator(this.locator.firstName).fill(data.firstName);
    await this.page.locator(this.locator.lastName).fill(data.lastName);
    await this.page.locator(this.locator.company).fill(data.company);
    await this.page.locator(this.locator.address).fill(data.address);

    await this.page.locator(this.locator.country).selectOption({
      label: data.country
    });

    await this.page.locator(this.locator.state).fill(data.state);
    await this.page.locator(this.locator.city).fill(data.city);
    await this.page.locator(this.locator.zipcode).fill(data.zipcode);
    await this.page.locator(this.locator.mobile).fill(data.mobile);

    await this.page.locator(this.locator.createAccountButton).click();

    await this.page.locator(this.locator.accountCreatedText).waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  async continue() {
    await this.page.locator(this.locator.continueButton).click();
  }
}
