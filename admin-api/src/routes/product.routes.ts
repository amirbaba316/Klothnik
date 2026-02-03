import express from 'express';
import multer from 'multer';
import ProductService from '../services/product.service';

const upload = multer();
const router = express.Router({ mergeParams: true }); // Important for accessing :categoryId
const productService = new ProductService();

// Helper to ensure string params
const getStringParam = (param: string | string[]): string => {
    return Array.isArray(param) ? param[0] : param;
};

/**
 *  @method POST
 *  @desc   Create a new product
 *  @access Admin
 */
router.post('/', upload.array('files'), async (req, res) => {
    const categoryId = getStringParam(req.params.categoryId);
    const {
        name,
        description,
        price,
        compareAtPrice,
        costPerItem,
        sku,
        rating,
        size,
        barcode,
        quantity,
        weight,
        status,
        tags,
        options,
        reviews,
    } = req.body;

    const files = req.files as Express.Multer.File[];

    const product = await productService.create({
        name,
        description,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        costPerItem: costPerItem ? Number(costPerItem) : undefined,
        sku,
        rating: rating ? Number(rating) : undefined,
        size,
        barcode,
        quantity: quantity ? Number(quantity) : undefined,
        weight: weight ? Number(weight) : undefined,
        category: categoryId,
        status,
        tags: tags ? JSON.parse(tags) : [],
        options: options ? JSON.parse(options) : undefined,
        reviews: reviews ? JSON.parse(reviews) : [],
        files,
    });

    res.send(product);
});

/**
 *  @method GET
 *  @desc   Get all products for a category
 *  @access Admin
 */
router.get('/', async (req, res) => {
    const products = await productService.getAll();
    res.send(products);
});

/**
 *  @method GET
 *  @desc   Get a product by ID
 *  @access Admin
 */
router.get('/:productId', async (req, res) => {
    const product = await productService.getById({
        productId: getStringParam(req.params.productId),
    });
    res.send(product);
});

/**
 *  @method PUT
 *  @desc   Update a product by ID
 *  @access Admin
 */
router.put('/:productId', upload.array('files'), async (req, res) => {
    const {
        name,
        description,
        price,
        compareAtPrice,
        costPerItem,
        sku,
        rating,
        size,
        barcode,
        quantity,
        weight,
        category,
        status,
        tags,
        options,
        reviews,
    } = req.body;

    const files = req.files as Express.Multer.File[];

    const product = await productService.update({
        productId: getStringParam(req.params.productId),
        name,
        description,
        price: price ? Number(price) : undefined,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        costPerItem: costPerItem ? Number(costPerItem) : undefined,
        sku,
        rating: rating ? Number(rating) : undefined,
        size,
        barcode,
        quantity: quantity ? Number(quantity) : undefined,
        weight: weight ? Number(weight) : undefined,
        category,
        status,
        tags: tags ? JSON.parse(tags) : undefined,
        options: options ? JSON.parse(options) : undefined,
        reviews: reviews ? JSON.parse(reviews) : undefined,
        files,
    });

    res.send(product);
});

/**
 *  @method DELETE
 *  @desc   Delete a product by ID
 *  @access Admin
 */
router.delete('/:productId', async (req, res) => {
    await productService.delete({
        productId: getStringParam(req.params.productId),
    });
    res.send({ success: true });
});

export default router;
