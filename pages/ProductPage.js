
import { ProductLocator } from '../locators/ProductLocator.js';

export class ProductPage {
  constructor(page) {
    this.page = page;
    this.locator = new ProductLocator();
  }

  async open() {
    await this.page.locator(this.locator.productsLink).first().click({
      timeout: 30000
    });

    await this.page.waitForURL(/\/products/, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
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
      timeout: 30000,
    });
  }

  async getProductNames() {
    return await this.page
      .locator(this.locator.productNames)
      .allTextContents();
  }

  
  async closeCartModal() {
    const modal = this.page.locator('#cartModal');

    // Tunggu modal muncul maksimal 5 detik
    const isModalVisible = await modal.isVisible().catch(() => false);

    if (!isModalVisible) {
      try {
        await modal.waitFor({
          state: 'visible',
          timeout: 5000
        });
      } catch {
        console.log('Cart modal tidak muncul, melanjutkan proses.');
        return;
      }
    }

    const continueButton = modal.getByRole('button', {
      name: /continue shopping/i,
    });

    await continueButton.click();

    await modal.waitFor({
      state: 'hidden',
      timeout: 10000
    });
  }


  async addProductToCart(productName) {
    const product = this.page
      .locator(this.locator.productCards)
      .filter({
        has: this.page.locator('.productinfo p', {
          hasText: productName,
        }),
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
    const modal = this.page.locator('#cartModal');

    if (await modal.isVisible()) {
      const continueShopping = modal.getByRole('button', {
        name: /continue shopping/i,
      });

      await continueShopping.click();
      await modal.waitFor({ state: 'hidden' });
    }

    const cartLink = this.page.locator('header a[href="/view_cart"]');

    await cartLink.click();
    await this.page.waitForURL(/\/view_cart/);
  }
}
