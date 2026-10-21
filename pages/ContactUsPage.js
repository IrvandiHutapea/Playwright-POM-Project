import { ContactUsLocator } from '../locators/ContactUsLocator.js';

export class ContactUsPage {
  constructor(page) {
    this.page = page;
    this.locator = new ContactUsLocator();
  }

  async open() {
    await this.page.locator(this.locator.contactUsLink).click();
  }

  async fillForm(data) {
    await this.page.locator(this.locator.name).fill(data.name);
    await this.page.locator(this.locator.email).fill(data.email);
    await this.page.locator(this.locator.subject).fill(data.subject);
    await this.page.locator(this.locator.message).fill(data.message);
  }

  async uploadFile(filePath) {
    await this.page.locator(this.locator.uploadFile).setInputFiles(filePath);
  }

  async submit() {
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await this.page.locator(this.locator.submitButton).click();
  }
}