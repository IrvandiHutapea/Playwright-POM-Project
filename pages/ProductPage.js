
import { ProductLocator } from '../locators/ProductLocator.js';

export class ProductPage {
  constructor(page) {
    this.page = page;
    this.locator = new ProductLocator();
  }

  async open() {
    await this.page.goto('/products', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.page.locator(this.locator.productsTitle).waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  async searchProduct(productName) {
    await this.page.locator(this.locator.searchInput).fill(productName);
    await this.page.locator(this.locator.searchButton).click();

    await this.page.locator(this.locator.productCards).first().waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  async getProductNames() {
    return await this.page
      .locator(this.locator.productNames)
      .allTextContents();
  }

  async closeCartModal() {
    const modal = this.page.locator('#cartModal');

    try {
      await modal.waitFor({
        state: 'visible',
        timeout: 10000
      });

      const continueButton = modal.getByRole('button', {
        name: /continue shopping/i
      });

      await continueButton.click();

      await modal.waitFor({
        state: 'hidden',
        timeout: 10000
      });
    } catch (error) {
      if (await modal.isVisible().catch(() => false)) {
        throw error;
      }

      console.log('Cart modal tidak muncul, melanjutkan proses.');
    }
  }

  async addProductToCart(productName) {
    const product = this.page
      .locator(this.locator.productCards)
      .filter({
        has: this.page.locator('.productinfo p', {
          hasText: productName
        })
      })
      .first();

    const addToCartButton = product.locator('a.add-to-cart');

    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click();

    await this.closeCartModal();
  }

  async addFirstProductToCart() {
    const addToCartButton = this.page
      .locator(this.locator.addToCartButtons)
      .first();

    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click();

    await this.closeCartModal();
  }

  async viewCart() {
    await this.page.goto('/view_cart', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.page.locator(this.page.locator ? '#cart_info_table' : '#cart_info_table')
      .waitFor({
        state: 'visible',
        timeout: 30000
      });
  }
}
