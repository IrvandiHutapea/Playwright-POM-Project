export class LoginLocator {
  email = '[data-qa="login-email"]';
  password = '[data-qa="login-password"]';
  loginButton = '[data-qa="login-button"]';
  loginTitle = 'text=Login to your account';
  errorMessage = 'text=Your email or password is incorrect!';
  signupLoginLink = 'a[href="/login"]';
}