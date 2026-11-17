import { test, expect } from '@playwright/test';
import { ProductApi } from '../../api/ProductApi.js';
import { resetApiReport, saveApiReport } from '../../utils/ApiReport.js';

test.describe('Product API Testing', () => {
  test.beforeAll(async () => { await resetApiReport(); });

  test('API 01 - Get all products list', async ({ request }, testInfo) => {
    const api = new ProductApi(request), start = Date.now();
    const response = await api.getProducts(), body = await response.json();
    const assertions = [
      { name: 'HTTP status is 200', expected: 200, actual: response.status(), passed: response.status() === 200 },
      { name: 'API responseCode is 200', expected: 200, actual: body.responseCode, passed: body.responseCode === 200 },
      { name: 'products is an Array', expected: 'Array', actual: Array.isArray(body.products) ? 'Array' : typeof body.products, passed: Array.isArray(body.products) },
      { name: 'products length > 0', expected: '> 0', actual: body.products?.length ?? 0, passed: !!body.products?.length }
    ];
    await saveApiReport({ title: testInfo.title, method: 'GET', endpoint: '/api/productsList',
      requestHeaders: { Accept: 'application/json' }, requestBody: null, httpStatus: response.status(),
      statusText: response.statusText(), responseTimeMs: Date.now()-start, responseHeaders: response.headers(),
      responseBody: body, assertions, summary: `Total products: ${body.products?.length ?? 0}` });
    for (const a of assertions) expect(a.passed, a.name).toBe(true);
  });

  test('API 02 - Search product with valid keyword', async ({ request }, testInfo) => {
    const api = new ProductApi(request), start = Date.now();
    const response = await api.searchProducts('top'), body = await response.json();
    const assertions = [
      { name: 'HTTP status is 200', expected: 200, actual: response.status(), passed: response.status() === 200 },
      { name: 'API responseCode is 200', expected: 200, actual: body.responseCode, passed: body.responseCode === 200 },
      { name: 'products is an Array', expected: 'Array', actual: Array.isArray(body.products) ? 'Array' : typeof body.products, passed: Array.isArray(body.products) },
      { name: 'Search returns products', expected: '> 0', actual: body.products?.length ?? 0, passed: !!body.products?.length }
    ];
    await saveApiReport({ title: testInfo.title, method: 'POST', endpoint: '/api/searchProduct',
      requestHeaders: { Accept: 'application/json' }, requestBody: { search_product: 'top' },
      httpStatus: response.status(), statusText: response.statusText(), responseTimeMs: Date.now()-start,
      responseHeaders: response.headers(), responseBody: body, assertions,
      summary: `Keyword: top | Results: ${body.products?.length ?? 0}` });
    for (const a of assertions) expect(a.passed, a.name).toBe(true);
  });

  test('API 03 - Search product without keyword', async ({ request }, testInfo) => {
    const api = new ProductApi(request), start = Date.now();
    const response = await api.searchProductsWithoutKeyword(), body = await response.json();
    const assertions = [
      { name: 'HTTP status is 200', expected: 200, actual: response.status(), passed: response.status() === 200 },
      { name: 'API responseCode is 400', expected: 400, actual: body.responseCode, passed: body.responseCode === 400 },
      { name: 'Message mentions search_product', expected: 'Contains search_product', actual: body.message ?? '', passed: String(body.message ?? '').includes('search_product') }
    ];
    await saveApiReport({ title: testInfo.title, method: 'POST', endpoint: '/api/searchProduct',
      requestHeaders: { Accept: 'application/json' }, requestBody: null, httpStatus: response.status(),
      statusText: response.statusText(), responseTimeMs: Date.now()-start, responseHeaders: response.headers(),
      responseBody: body, assertions, summary: 'Negative test: request without search_product' });
    for (const a of assertions) expect(a.passed, a.name).toBe(true);
  });
});
