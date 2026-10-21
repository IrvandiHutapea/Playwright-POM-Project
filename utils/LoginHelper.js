import { HomePage } from '../pages/HomePage.js';
import { Login } from '../pages/Login.js';

export async function login(page, email, password) {
  const home = new HomePage(page);
  const loginPage = new Login(page);

  await home.open();
  await home.openLogin();
  await loginPage.login(email, password);
}