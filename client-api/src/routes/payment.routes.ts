import express from 'express';
import auth from '../middlewares/auth';
import PaymentService from '../services/payment.service';

const router = express.Router();
const paymentService = new PaymentService();

/**
 *  @method POST
 *  @desc   Initiate Razorpay order
 *  @access Private
 */
router.post('/create-order', [auth], async (req: any, res: any) => {
    const { amount, currency, orderId, paymentMethod } = req.body;
    const data = await paymentService.createRazorpayOrder({
        user: req.user,
        orderId,
        paymentMethod,
    });
    res.send(data);
});

/**
 *  @method POST
 *  @desc   Confirm payment after success
 *  @access Private
 */
router.post('/confirm', [auth], async (req: any, res: any) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    const payment = await paymentService.verifyAndSavePayment({
        user: req.user,
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
    });
    res.send(payment);
});

/**
 *  @method GET
 *  @desc   Get all payments of a user
 *  @access Private
 */
router.get('/', [auth], async (req: any, res: any) => {
    const payments = await paymentService.getAll({ user: req.user });
    res.send(payments);
});

export default router;
