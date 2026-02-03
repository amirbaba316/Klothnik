import express from 'express';
import OrderService from '../services/order.service';

const router = express.Router();
const orderService = new OrderService();

/**
 * @method GET
 * @desc   Get all orders
 * @access Admin
 */
router.get('/', async (req, res) => {
    const orders = await orderService.getAll();
    res.send(orders);
});

/**
 * @method GET
 * @desc   Get order by ID
 * @access Admin
 */
router.get('/:orderId', async (req, res) => {
    const order = await orderService.getById({ orderId: req.params.orderId });
    res.send(order);
});

/**
 * @method PUT
 * @desc   Update order status or tracking number
 * @access Admin
 */
router.put('/:orderId', async (req, res) => {
    const { status, trackingNumber, notes } = req.body;
    const updatedOrder = await orderService.update({
        orderId: req.params.orderId,
        status,
        trackingNumber,
        notes,
    });
    res.send(updatedOrder);
});

/**
 * @method PUT
 * @desc   Update order status or tracking number
 * @access Admin
 */
router.put('/:orderId/view-order', async (req, res) => {
    const updatedOrder = await orderService.updateViewOrder({
        orderId: req.params.orderId,
    });
    res.send(updatedOrder);
});

/**
 * @method DELETE
 * @desc   Delete an order
 * @access Admin
 */
router.delete('/:orderId', async (req, res) => {
    await orderService.delete({ orderId: req.params.orderId });
    res.send({ success: true });
});

export default router;
