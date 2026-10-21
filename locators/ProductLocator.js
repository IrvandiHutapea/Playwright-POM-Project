export class ProductLocator {
  productsLink = 'a[href="/products"]';
  productsTitle = 'h2:has-text("All Products")';
  searchInput = '#search_product';
  searchButton = '#submit_search';
  productCards = '.product-image-wrapper';
  productNames = '.productinfo p';
  addToCartButtons = '.productinfo a.add-to-cart';
  viewCartLink = 'a[href="/view_cart"]';
  firstProductView = '.choose a';
}