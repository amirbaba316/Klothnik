import { Express } from 'express';
import categoryRoutes from '../routes/category.routes';
import productRoutes from '../routes/product.routes';
import productVariantRoutes from '../routes/product-variant.routes';
import orderRoutes from '../routes/order.routes';
import userRoutes from '../routes/user.routes';

export const init = (app: Express) => {
    app.use('/api/v1/categories', categoryRoutes);
    app.use('/api/v1/categories/:categoryId/products', productRoutes);
    // Variants are now nested under products, not categories
    app.use('/api/v1/products/:productId/variants', productVariantRoutes);
    app.use('/api/v1/orders', orderRoutes);
    app.use('/api/v1/users', userRoutes);
};
