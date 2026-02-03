import express from 'express';
import ProductVariantService from '../services/product-variant.service';

const router = express.Router({ mergeParams: true }); // Important for accessing :productId
const productVariantService = new ProductVariantService();

/**
 * @method POST
 * @desc Create a new product variant
 * @access Admin
 */
router.post('/', async (req, res) => {
    const { productId } = req.params as any;
    const { sku, price, compareAtPrice, costPerItem, barcode, quantity, weight, size, color, image, status } = req.body;

    const variant = await productVariantService.create({
        productId,
        sku,
        price,
        compareAtPrice,
        costPerItem,
        barcode,
        quantity,
        weight,
        size,
        color,
        image,
        status,
    });

    res.send(variant);
});

/**
 * @method GET
 * @desc Get all variants for a product
 * @access Admin
 */
router.get('/', async (req, res) => {
    const { productId } = req.params as any;
    const variants = await productVariantService.getByProductId({ productId });
    res.send(variants);
});

/**
 * @method GET
 * @desc Get a specific variant
 * @access Admin
 */
router.get('/:variantId', async (req, res) => {
    const variant = await productVariantService.getById({
        variantId: req.params.variantId,
    });
    res.send(variant);
});

/**
 * @method PUT
 * @desc Update a variant
 * @access Admin
 */
router.put('/:variantId', async (req, res) => {
    const { productId } = req.params as any;
    const { sku, price, compareAtPrice, costPerItem, barcode, quantity, weight, size, color, image, status } = req.body;

    const updated = await productVariantService.update({
        variantId: req.params.variantId,
        productId,
        updates: {
            sku,
            price,
            compareAtPrice,
            costPerItem,
            barcode,
            quantity,
            weight,
            size,
            color,
            image,
            status,
        },
    });

    res.send(updated);
});

/**
 * @method DELETE
 * @desc Delete a variant
 * @access Admin
 */
router.delete('/:variantId', async (req, res) => {
    const { productId } = req.params as any;

    await productVariantService.delete({
        variantId: req.params.variantId,
        productId,
    });

    res.send({ success: true });
});

export default router;
