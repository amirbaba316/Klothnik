import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { OrderStatusEnum, PaymentMethodTypeEnum } from '../enums';
import { Counter } from './counter.model';

const collectionName = 'Order';

export interface IOrderTimeLineStep {
    date: Date;
    message: string;
    status: number;
}

export interface IOrderItem {
    product: string;
    variant: string;
    quantity: number;
    price: number;
}

export interface IOrderTimeline {
    orderPlaced: IOrderTimeLineStep;
    orderConfirmed: IOrderTimeLineStep;
    processing: IOrderTimeLineStep;
    shipped: IOrderTimeLineStep;
    outForDelivery: IOrderTimeLineStep;
}

export interface IOrder extends Document {
    _id: string;
    user: string;
    items: IOrderItem[];
    shippingFee: number;
    tax: number;
    discount?: number;
    total: number;
    shippingAddress: string;
    paymentMethod: PaymentMethodTypeEnum;
    razorpayOrderId?: string;
    status: OrderStatusEnum;
    trackingNumber?: string;
    notes?: string;
    orderTimeline?: IOrderTimeline;
}

export interface IOrderMethods {}

export type OrderDocument = HydratedDocument<IOrder, IOrderMethods>;

export interface OrderModel extends Model<IOrder, {}, IOrderMethods> {}

const OrderSchema = new Schema<IOrder, OrderModel, IOrderMethods>(
    {
        _id: {
            type: String,
        },
        user: {
            type: String,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: String,
                    ref: 'Product',
                    required: true,
                },
                variant: {
                    type: String,
                    ref: 'ProductVariant',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        shippingFee: {
            type: Number,
            min: 0,
        },
        tax: {
            type: Number,
            min: 0,
        },
        discount: {
            type: Number,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingAddress: {
            type: String,
            ref: 'Address',
            required: true,
        },
        razorpayOrderId: {
            type: String,
            trim: true,
        },

        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethodTypeEnum),
        },
        status: {
            type: String,
            enum: Object.values(OrderStatusEnum),
            default: OrderStatusEnum.PENDING,
        },
        trackingNumber: {
            type: String,
        },
        notes: {
            type: String,
        },
        orderTimeline: {
            orderPlaced: {
                date: { type: Date, default: Date.now() },
                message: 'Your Order has been Placed',
                status: OrderStatusEnum.PLACED,
            },
            orderConfirmed: {
                date: { type: Date, default: null },
                message: 'Your Order has been Confirmed',
                status: OrderStatusEnum.CONFIRMED,
            },
            processing: {
                date: { type: Date, default: null },
                message: 'Your Order Is Processing',
                status: OrderStatusEnum.PROCESSING,
            },
            shipped: {
                date: { type: Date, default: null },
                message: 'Your Order has been Shipped',
                status: OrderStatusEnum.SHIPPED,
            },
            outForDelivery: {
                date: { type: Date, default: null },
                message: 'Your Order is Out for Delivery',
                status: OrderStatusEnum.OUT_FOR_DELIVERY,
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
        minimize: false,
        collection: collectionName,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
    }
);

OrderSchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await Order.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
};

export const Order = model<IOrder, OrderModel>(collectionName, OrderSchema);
