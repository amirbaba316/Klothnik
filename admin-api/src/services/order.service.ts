import { NotFoundError } from '@hyperflake/http-errors';
import { Order } from '@klothnick/shared/models';

interface UpdateOrderParams {
    orderId: string;
    status?: string;
    trackingNumber?: string;
    notes?: string;
}

export default class OrderService {
    /**
     * @desc Get all orders
     */
    async getAll() {
        return await Order.find()
            .populate('user items.product items.variant shippingAddress billingAddress paymentMethod')
            .sort({ createdAt: -1 });
    }

    /**
     * @desc Get a single order by ID
     */
    async getById(params: { orderId: string }) {
        const order = await Order.findById(params.orderId).populate(
            'user items.product items.variant shippingAddress billingAddress paymentMethod'
        );

        if (!order) throw new NotFoundError('Order not found');
        return order.toObject();
    }

    /**
     * @desc Update order status or tracking info
     */
    async update(params: UpdateOrderParams) {
        const updated = await Order.findByIdAndUpdate(
            params.orderId,
            {
                ...(params.status && { status: params.status }),
                ...(params.trackingNumber && { trackingNumber: params.trackingNumber }),
                ...(params.notes && { notes: params.notes }),
            },
            { new: true }
        );

        if (!updated) throw new NotFoundError('Order not found');
        return updated.toObject();
    }

    /**
     * @desc Delete an order
     */
    async delete(params: { orderId: string }) {
        const deleted = await Order.findByIdAndDelete(params.orderId);
        if (!deleted) throw new NotFoundError('Order not found');
    }
}
