export class ProductApi {
  constructor(request) { this.request = request; }
  async getProducts() { return this.request.get('/api/productsList'); }
  async searchProducts(keyword) {
    return this.request.post('/api/searchProduct', { multipart: { search_product: keyword } });
  }
  async searchProductsWithoutKeyword() { return this.request.post('/api/searchProduct'); }
}
