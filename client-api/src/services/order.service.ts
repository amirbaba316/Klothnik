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
        shippingFee?: any;
        tax?: any;
        discount?: any;
        shippingAddress: string;
        billingAddress?: string;
        paymentMethod: string;
        notes?: string;
    }) {
        const { user, items, shippingAddress, billingAddress, paymentMethod, notes } = params;

        const toNumber = (value: any, fallback = 0): number => {
            if (value === null || value === undefined) return fallback;
            if (typeof value === 'string' && value.trim() === '') return fallback;

            const n = Number(value);
            return Number.isFinite(n) ? n : fallback;
        };

        // tax / discount can be “not available” → we treat as 0
        const shippingFee = toNumber(params.shippingFee, 0);
        const tax = toNumber(params.tax, 0);
        const discount = toNumber(params.discount, 0);

        const subTotal = items.reduce((sum, item) => {
            const price = toNumber(item.price, 0);
            const qty = toNumber(item.quantity, 1);
            return sum + price * qty;
        }, 0);

        const total = subTotal + tax + shippingFee - discount;

        if (!Number.isFinite(total)) {
            console.error('Invalid total value:', {
                subTotal,
                tax,
                shippingFee,
                discount,
                total,
            });
            throw new Error('Computed total is invalid (NaN or Infinity)');
        }

        const order = await Order.create({
            user: user._id,
            items,
            subTotal,
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
            .populate([
                { path: 'items.product' },
                { path: 'items.variant' },
                {
                    path: 'shippingAddress',
                    populate: {
                        path: 'user', // this is the nested populate
                    },
                },
            ])
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
