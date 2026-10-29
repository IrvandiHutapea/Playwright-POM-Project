export class CartLocator {
  cartLink = 'a[href="/view_cart"]';
  cartTable = '#cart_info_table';
  cartRows = '#cart_info_table tbody tr';
  productNames = '#cart_info_table tbody tr .cart_description h4 a';
  productQuantities = '#cart_info_table tbody tr .cart_quantity button';
  deleteButtons = '#cart_info_table tbody tr .cart_quantity_delete';
}
