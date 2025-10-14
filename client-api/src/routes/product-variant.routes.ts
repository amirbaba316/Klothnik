import { Router } from 'express';
import auth from '../middlewares/auth';
import ProductVariantService from '../services/product-variant.service';

const router = Router();
const productVariantService = new ProductVariantService();

// GET all variants of a product
router.get('/', [auth], (req: any, res: any) => {
    const variants = productVariantService.getVariantsByProductId({ user: req.user, productId: req.params.productId });

    res.send(variants);
});

// GET single variant by ID
router.get('/:variantId', [auth], (req: any, res: any) => {
    const { size, color } = req.query;
    const variant = productVariantService.getById({
        size: size,
        color: color,
        user: req.user,
        variantId: req.params.variantId,
    });
    res.send(variant);
});

export default router;
