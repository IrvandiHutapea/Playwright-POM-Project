export class ContactUsLocator {
  contactUsLink = 'a[href="/contact_us"]';
  name = '[data-qa="name"]';
  email = '[data-qa="email"]';
  subject = '[data-qa="subject"]';
  message = '[data-qa="message"]';
  uploadFile = 'input[name="upload_file"]';
  submitButton = '[data-qa="submit-button"]';
  successMessage = 'div.status.alert.alert-success';
}