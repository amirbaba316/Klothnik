import express from 'express';
import OrderService from '../services/order.service';
import auth from '../middlewares/auth';

const router = express.Router();
const orderService = new OrderService();

router.post('/', [auth], async (req: any, res: any) => {
    const {
        items,
        subtotal,
        shippingFee,
        tax,
        discount,
        total,
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes,
    } = req.body;

    const order = await orderService.create({
        user: req.user,
        items,
        subtotal,
        shippingFee,
        tax,
        discount,
        total,
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes,
    });

    res.send(order);
});

/**
 *  @method GET
 *  @desc   Get orders of logged-in user
 *  @access Private
 */
router.get('/', [auth], async (req: any, res: any) => {
    const orders = await orderService.getAllByUser({ user: req.user });
    res.send(orders);
});

/**
 *  @method GET
 *  @desc   Get single order by ID
 *  @access Private
 */
router.get('/:orderId', [auth], async (req: any, res: any) => {
    const order = await orderService.getById({ user: req.user, orderId: req.params.orderId });
    res.send(order);
});

export default router;
