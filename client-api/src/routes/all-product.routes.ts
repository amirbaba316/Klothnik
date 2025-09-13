import express from 'express';
import ProductService from '../services/product.service';
const productService = new ProductService();
const router = express.Router();

/**
 *  @method GET
 *  @desc   Get all products (optionally filterable)
 *  @access Public (or token-authenticated if needed)
 */
router.get('/', async (req, res) => {
    const products = await productService.getAllProducts({ query: req.query });
    res.send(products);
});

/**
 *  @method GET
 *  @desc   Get product by ID
 *  @access Public
 */
router.get('/:productId', async (req, res) => {
    const product = await productService.getAllProductsById({ productId: req.params.productId });
    res.send(product);
});

export default router;
