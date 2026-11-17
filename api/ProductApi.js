
export class ProductApi {
  constructor(request) {
    this.request = request;
  }

  async getProducts() {
    return this.request.get('/api/productsList', {
      headers: {
        Accept: 'application/json'
      }
    });
  }

  async searchProducts(keyword) {
    return this.request.post('/api/searchProduct', {
      multipart: {
        search_product: keyword
      },
      headers: {
        Accept: 'application/json'
      }
    });
  }

  async searchProductsWithoutKeyword() {
    return this.request.post('/api/searchProduct', {
      form: {},
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
}