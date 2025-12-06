import { NotFoundError } from '@hyperflake/http-errors';
import { OrderStatusEnum } from '@klothnick/shared/enums';
import { IUser, Order, CancelOrder } from '@klothnick/shared/models';

export default class OrderService {
    /**
     *  @desc   Create an order.
     */
    async create(params: {
        user: IUser;
        items: {
            product: string;
            variant: string;
            quantity: number;
            price: number;
        }[];
        subtotal: number;
        shippingFee: number;
        tax: number;
        discount?: number;
        total: number;
        shippingAddress: string;
        billingAddress?: string;
        paymentMethod: string;
        notes?: string;
    }) {
        const {
            user,
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
        } = params;

        const order = await Order.create({
            user: user._id,
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

        return order.toObject();
    }

    /**
     *  @desc   Get all orders of logged-in user.
     */
    async getAllByUser(params: { user: IUser }) {
        const { user } = params;

        return await Order.find({ user: user._id, status: { $ne: OrderStatusEnum.CANCELLED } })
            .populate([{ path: 'items.product' }, { path: 'items.variant' }])
            .sort({ createdAt: -1 });
    }

    /**
     *  @desc   Get all cancelled orders of logged-in user.
     */
    async getAllCancelledOrdersByUser(params: { user: IUser }) {
        const { user } = params;

        return await Order.find({ user: user._id, status: OrderStatusEnum.CANCELLED })
            .populate([{ path: 'items.product' }, { path: 'items.variant' }])
            .sort({ createdAt: -1 });
    }

    /**
     *  @desc   Get order by ID (only if owned by user)
     */
    async getById(params: { user: IUser; orderId: string }) {
        const { user, orderId } = params;

        const order = await Order.findOne({
            _id: orderId,
            user: user._id,
        }).populate([
            { path: 'items.product' },
            { path: 'items.variant' },
            {
                path: 'shippingAddress',
                populate: {
                    path: 'user', // this is the nested populate
                },
            },
        ]);

        if (!order) throw new NotFoundError('Order not found');

        return order.toObject();
    }

    /**
     *  @desc   Cancel order by ID (only if owned by user)
     */
    async cancelOrder(params: { user: IUser; orderId: string; reason: string }) {
        const { user, orderId, reason } = params;

        const order = await Order.findOne({ _id: orderId, user: user._id });

        if (!order) throw new NotFoundError('Order not found');

        await CancelOrder.create({
            user: user._id,
            order: orderId,
            reason: reason,
            orderStatus: order.status,
        });

        order.status = OrderStatusEnum.CANCELLED;

        await order.save();

        return;
    }
}
