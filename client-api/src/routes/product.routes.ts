import express from 'express';
import ProductService from '../services/product.service';
import auth from '../middlewares/auth';
const productService = new ProductService();
const router = express.Router();

/**
 *  @method GET
 *  @desc   Get all products (optionally filterable)
 *  @access Public (or token-authenticated if needed)
 */
router.get('/', [auth], async (req, res) => {
    const products = await productService.getAll({ query: req.query });
    res.send(products);
});

/**
 *  @method GET
 *  @desc   Get product by ID
 *  @access Public
 */
router.get('/:productId', [auth], async (req, res) => {
    const product = await productService.getById({ productId: req.params.productId });
    res.send(product);
});

/**
 *  @method GET
 *  @desc   Search product by name or description
 *  @access Public
 */
router.get('/search', [auth], async (req, res) => {
    const products = await productService.searchProduct({ searchQuery: req.query.q as string, user: req.user });
    res.send(products);
});

export default router;
