import express from 'express';
import ProductVariantService from '../services/product-variant.service';

const router = express.Router();
const productVariantService = new ProductVariantService();

router.post('/', async (req, res) => {
    const { productId, sku, price, compareAtPrice, costPerItem, barcode, quantity, weight, options, image, status } =
        req.body;

    const variant = await productVariantService.create({
        productId,
        sku,
        price,
        compareAtPrice,
        costPerItem,
        barcode,
        quantity,
        weight,
        options,
        image,
        status,
    });

    res.send(variant);
});

router.get('/', async (_req, res) => {
    const variants = await productVariantService.getAll();
    res.send(variants);
});

router.get('/:variantId', async (req, res) => {
    const variant = await productVariantService.getById({ variantId: req.params.variantId });
    res.send(variant);
});

router.put('/:variantId', async (req, res) => {
    const { productId, sku, price, compareAtPrice, costPerItem, barcode, quantity, weight, options, image, status } =
        req.body;

    const updated = await productVariantService.update({
        variantId: req.params.variantId,
        updates: {
            productId,
            sku,
            price,
            compareAtPrice,
            costPerItem,
            barcode,
            quantity,
            weight,
            options,
            image,
            status,
        },
    });

    res.send(updated);
});

router.delete('/:variantId', async (req, res) => {
    await productVariantService.delete({ variantId: req.params.variantId });
    res.send({ success: true });
});

export default router;
