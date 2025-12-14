import { NotFoundError } from '@hyperflake/http-errors';
import { Order } from '@klothnick/shared/models';

interface UpdateOrderParams {
    orderId: string;
    status?: string;
    trackingNumber?: string;
    notes?: string;
}

export default class AdminOrderService {
    /**
     * @desc Get all orders (admin)
     */
    async getAll() {
        return await Order.find()
            .populate([
                { path: 'user' },
                { path: 'items.product' },
                { path: 'items.variant' },
                { path: 'shippingAddress' },
            ])
            .sort({ createdAt: -1 });
    }

    /**
     * @desc Get a single order by ID (admin)
     */
    async getById(params: { orderId: string }) {
        const order = await Order.findById(params.orderId).populate([
            { path: 'user' },
            { path: 'items.product' },
            { path: 'items.variant' },
            { path: 'shippingAddress' },
        ]);

        if (!order) throw new NotFoundError('Order not found');
        return order.toObject();
    }

    /**
     * @desc Update order status, tracking, or notes (admin)
     * Automatically updates orderTimeline when status changes
     */
    async update(params: UpdateOrderParams) {
        const { orderId, status, trackingNumber, notes } = params;

        const updateData: any = {};

        // If status is being updated, update the timeline
        if (status) {
            updateData.status = status;

            // Only update timeline if status is not CANCELLED
            if (status !== 'CANCELLED') {
                const now = new Date();

                // Map status to timeline field and update it
                const timelineUpdates: Record<string, any> = {};

                switch (status) {
                    case 'PLACED':
                        timelineUpdates['orderTimeline.orderPlaced.date'] = now;
                        timelineUpdates['orderTimeline.orderPlaced.flag'] = true;
                        break;

                    case 'CONFIRMED':
                        timelineUpdates['orderTimeline.orderPlaced.flag'] = true;
                        timelineUpdates['orderTimeline.orderConfirmed.date'] = now;
                        timelineUpdates['orderTimeline.orderConfirmed.flag'] = true;
                        break;

                    case 'PROCESSING':
                        timelineUpdates['orderTimeline.orderPlaced.flag'] = true;
                        timelineUpdates['orderTimeline.orderConfirmed.flag'] = true;
                        timelineUpdates['orderTimeline.processing.date'] = now;
                        timelineUpdates['orderTimeline.processing.flag'] = true;
                        break;

                    case 'SHIPPED':
                        timelineUpdates['orderTimeline.orderPlaced.flag'] = true;
                        timelineUpdates['orderTimeline.orderConfirmed.flag'] = true;
                        timelineUpdates['orderTimeline.processing.flag'] = true;
                        timelineUpdates['orderTimeline.shipped.date'] = now;
                        timelineUpdates['orderTimeline.shipped.flag'] = true;
                        break;

                    case 'OUT_FOR_DELIVERY':
                        timelineUpdates['orderTimeline.orderPlaced.flag'] = true;
                        timelineUpdates['orderTimeline.orderConfirmed.flag'] = true;
                        timelineUpdates['orderTimeline.processing.flag'] = true;
                        timelineUpdates['orderTimeline.shipped.flag'] = true;
                        timelineUpdates['orderTimeline.outForDelivery.date'] = now;
                        timelineUpdates['orderTimeline.outForDelivery.flag'] = true;
                        break;

                    case 'DELIVERED':
                        timelineUpdates['orderTimeline.orderPlaced.flag'] = true;
                        timelineUpdates['orderTimeline.orderConfirmed.flag'] = true;
                        timelineUpdates['orderTimeline.processing.flag'] = true;
                        timelineUpdates['orderTimeline.shipped.flag'] = true;
                        timelineUpdates['orderTimeline.outForDelivery.flag'] = true;
                        timelineUpdates['orderTimeline.delivered.date'] = now;
                        timelineUpdates['orderTimeline.delivered.flag'] = true;
                        break;
                }

                // Merge timeline updates into updateData
                Object.assign(updateData, timelineUpdates);
            }
        }

        // Update tracking number if provided
        if (trackingNumber !== undefined) {
            updateData.trackingNumber = trackingNumber;
        }

        // Update notes if provided
        if (notes !== undefined) {
            updateData.notes = notes;
        }

        const updated = await Order.findByIdAndUpdate(orderId, { $set: updateData }, { new: true }).populate([
            { path: 'user' },
            { path: 'items.product' },
            { path: 'items.variant' },
            { path: 'shippingAddress' },
        ]);

        if (!updated) throw new NotFoundError('Order not found');
        return updated.toObject();
    }

    /**
     * @desc Delete an order (admin)
     */
    async delete(params: { orderId: string }) {
        const deleted = await Order.findByIdAndDelete(params.orderId);
        if (!deleted) throw new NotFoundError('Order not found');
    }
}
