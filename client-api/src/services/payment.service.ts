import { Payment, IPayment, Order, IUser } from '@klothnick/shared/models';
import { PaymentStatusEnum, PaymentMethodTypeEnum, OrderStatusEnum } from '@klothnick/shared/enums';
import { BadRequestError, NotFoundError } from '@hyperflake/http-errors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default class PaymentService {
    async createRazorpayOrder(params: { user: IUser; orderId: string; paymentMethod: PaymentMethodTypeEnum }) {
        const { user, orderId, paymentMethod } = params;

        const order = await Order.findById(orderId);
        if (!order || order.user.toString() !== user._id.toString()) {
            throw new NotFoundError('Order not found or access denied');
        }

        const amount = order.total;
        const currency = 'INR';

        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // Razorpay requires amount in paise
            currency,
            receipt: `order_${orderId}_${Date.now()}`,
        });

        // (Optional) Store Razorpay order ID in DB for future reference
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return {
            bookingId: order._id,
            razorpayKey: process.env.RAZORPAY_KEY_ID!,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        };
    }

    async verifyAndSavePayment(params: {
        user: IUser;
        orderId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }) {
        const { user, orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            throw new BadRequestError('Invalid Razorpay signature');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await Order.findOne({ _id: orderId, user: user._id }).session(session);
            if (!order) throw new NotFoundError('Order not found or access denied');

            // Ensure the payment ID wasn't already used
            const existing = await Payment.findOne({
                transactionId: razorpayPaymentId,
            }).session(session);

            if (existing) throw new BadRequestError('Duplicate payment');

            // (Optional) Check that order is not already marked as paid
            if (order.status === OrderStatusEnum.PAID) {
                throw new BadRequestError('Order is already paid');
            }

            // Save payment
            const [payment] = await Payment.create(
                [
                    {
                        order: order._id,
                        user: user._id,
                        amount: order.total,
                        currency: 'INR',
                        paymentMethod: PaymentMethodTypeEnum.RAZORPAY,
                        transactionId: razorpayPaymentId,
                        status: PaymentStatusEnum.SUCCESS,
                        paymentDate: new Date(),
                        gatewayResponse: {
                            razorpayOrderId,
                            razorpayPaymentId,
                            razorpaySignature,
                        },
                    },
                ],
                { session }
            );

            // Mark order as paid
            order.status = OrderStatusEnum.PAID;
            await order.save({ session });

            await session.commitTransaction();
            return payment.toObject();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    async getAll(params: { user: IUser }) {
        return await Payment.find({ user: params.user._id }).sort({ createdAt: -1 });
    }
}
