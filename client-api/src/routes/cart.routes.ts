import express from 'express';
import auth from '../middlewares/auth';
import CartService from '../services/cart.service';

const router = express.Router();
const cartService = new CartService();

/**
 *  @method GET
 *  @desc   Get cart for logged-in user
 *  @access Private
 */
router.get('/', [auth], async (req: any, res: any) => {
    const cart = await cartService.getCart({ user: req.user });
    res.send(cart);
});

/**
 *  @method POST
 *  @desc   Add item to cart
 *  @access Private
 */
router.post('/add', [auth], async (req: any, res: any) => {
    const { product, variant, quantity } = req.body;
    const cart = await cartService.addItem({
        user: req.user,
        product,
        variant,
        quantity,
    });
    res.send(cart);
});

/**
 *  @method PUT
 *  @desc   Update item quantity in cart
 *  @access Private
 */
router.put('/update', [auth], async (req: any, res: any) => {
    const { product, variant, quantity } = req.body;
    const cart = await cartService.updateItem({
        user: req.user,
        product,
        variant,
        quantity,
    });
    res.send(cart);
});

/**
 *  @method DELETE
 *  @desc   Remove item from cart
 *  @access Private
 */
router.delete('/remove', [auth], async (req: any, res: any) => {
    const { product, variant } = req.body;
    const cart = await cartService.removeItem({
        user: req.user,
        product,
        variant,
    });
    res.send(cart);
});

export default router;
