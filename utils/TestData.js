
import { readExcel } from './ExcelUtils.js';

const loginRows = readExcel('LoginData.xlsx', 'Login');
const registerRows = readExcel('RegisterData.xlsx', 'Register');
const productRows = readExcel('ProductData.xlsx', 'Product');
const contactRows = readExcel('ContactUsData.xlsx', 'Contactus');
const cartRows = readExcel('CartData.xlsx', 'Cart');

const validLoginRow = loginRows[0];

if (!validLoginRow) {
  throw new Error(
    'Data login kosong. Periksa LoginData.xlsx, sheet Login.'
  );
}

if (!registerRows.length) {
  throw new Error(
    'Data register kosong. Periksa RegisterData.xlsx, sheet Register.'
  );
}

if (!productRows.length) {
  throw new Error(
    'Data product kosong. Periksa ProductData.xlsx, sheet Product.'
  );
}

if (!contactRows.length) {
  throw new Error(
    'Data Contact Us kosong. Periksa ContactUsData.xlsx, sheet Contactus.'
  );
}

if (!cartRows.length) {
  throw new Error(
    'Data cart kosong. Periksa CartData.xlsx, sheet Cart.'
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

  contact: contactRows.map((row) => ({
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
  })),

  register: registerRows.map((row) => ({
    ...row,
    email: generateUser().email,
    password: row.password,
    name: row.name,
    firstName: row.firstName,
    lastName: row.lastName,
    company: row.company,
    address: row.address,
    country: row.country,
    state: row.state,
    city: row.city,
    zipcode: String(row.zipcode ?? ''),
    mobile: String(row.mobile ?? ''),
  })),

  product: productRows.map((row) => ({
    searchProduct: row.searchProduct,
    expectedProduct: row.expectedProduct,
    quantity: Number(row.quantity || 1),
  })),

  cart: cartRows.map((row) => ({
    scenario: row.scenario,
    searchProduct: row.searchProduct,
    expectedProduct: row.expectedProduct,
    expectedRowCount: Number(row.expectedRowCount || 0),
    removeFirstProduct: String(
      row.removeFirstProduct ?? 'No'
    ),
    expectedRemainingCount: Number(
      row.expectedRemainingCount || 0
    ),
  })),
};

export function generateUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);

  return {
    name: `TestUser${timestamp}`,
    email: `testuser${timestamp}${random}@example.com`,
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

