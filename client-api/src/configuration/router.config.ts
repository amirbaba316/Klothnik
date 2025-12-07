import { Express } from 'express';
import authRoutes from '../routes/auth.routes';
import cartRoutes from '../routes/cart.routes';
import categoryRoutes from '../routes/category.routes';
import orderRoutes from '../routes/order.routes';
import productRoutes from '../routes/product.routes';
import allProductRoutes from '../routes/all-product.routes';
import userRoutes from '../routes/user.routes';
import reviewRoutes from '../routes/review.routes';
import paymentRoutes from '../routes/payment.routes';
import productVariants from '../routes/product-variant.routes';
import addressRoutes from '../routes/address.routes';
import legalRoutes from '../routes/legal.routes';

export const init = (app: Express) => {
    app.use('/api/v1/legal', legalRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/cart', cartRoutes);
    app.use('/api/v1/categories', categoryRoutes);
    app.use('/api/v1/orders', orderRoutes);
    app.use('/api/v1/payment', paymentRoutes);
    app.use('/api/v1/products/:productId/product-variants', productVariants);
    app.use('/api/v1/all-products', allProductRoutes);
    app.use('/api/v1/categories/:categoryId/products', productRoutes);
    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/address', addressRoutes);
    app.use('/api/v1/category/:categoryId/products/:productId/reviews', reviewRoutes);
};
