
import { readExcel } from './ExcelUtils.js';

const loginRows = readExcel('LoginData.xlsx', 'Login');

const validLoginRow = loginRows[0];

if (!validLoginRow) {
  throw new Error(
    'Data login kosong. Periksa LoginData.xlsx, sheet Login.'
  );
}

export const TestData = {
  validLogin: {
    email: validLoginRow.email,
    password: validLoginRow.password,
  },

  invalidLogin: {
    email: 'invalid@example.com',
    password: 'wrong-password',
  },

  contact: {
    name: 'Playwright Tester',
    email: 'playwright.tester@example.com',
    subject: 'Automation Test',
    message:
      'This message was submitted by a Playwright automation test.',
  },
};


export function generateUser() {
  const timestamp = Date.now();

  return {
    name: `TestUser${timestamp}`,
    email: `testuser${timestamp}@example.com`,
    password: 'TestPassword123!',

    firstName: 'Playwright',
    lastName: 'Tester',
    company: 'Automation Testing',
    address: 'Jl. Testing No. 123',
    country: 'United States',
    state: 'Jakarta',
    city: 'Jakarta',
    zipcode: '12345',
    mobile: '081234567890',
  };
}