import { NotFoundError } from '@hyperflake/http-errors';
import { OrderStatusEnum } from '@klothnick/shared/enums';
import { IUser, Order } from '@klothnick/shared/models';

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

        return await Order.find({ user: user._id, status: OrderStatusEnum.CANCELLED })
            .populate([{ path: 'items.product' }, { path: 'items.variant' }])
            .sort({ createdAt: -1 });
    }

    /**
     *  @desc   Get order by ID (only if owned by user)
     */
    async getById(params: { user: IUser; orderId: string }) {
        const { user, orderId } = params;

        const order = await Order.findOne({ _id: orderId, user: user._id }).populate([
            { path: 'items.product' },
            { path: 'items.variant' },
        ]);

        if (!order) throw new NotFoundError('Order not found');

        return order.toObject();
    }

    /**
     *  @desc   Delete order by ID (only if owned by user)
     */
    async deleteOrder(params: { user: IUser; orderId: string }) {
        const { user, orderId } = params;

        const order = await Order.findOne({ _id: orderId, user: user._id });

        if (!order) throw new NotFoundError('Order not found');

        order.status = OrderStatusEnum.CANCELLED;

        await order.save();

        return order;
    }
}
