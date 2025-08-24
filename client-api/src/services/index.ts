import AuthService from './auth.service';
import CategoryService from './category.service';
import ProductService from './product.service';
import OrderService from './order.service';
import CartService from './cart.service';
import ReviewService from './review.service';
import AddressService from './address.service';
import PaymentService from './payment.service';

export const authService = new AuthService();
export const categoryService = new CategoryService();
export const productService = new ProductService();
export const orderService = new OrderService();
export const cartService = new CartService();
export const reviewService = new ReviewService();
export const addressService = new AddressService();
export const paymentService = new PaymentService();
