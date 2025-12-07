import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { OrderStatusEnum, PaymentMethodTypeEnum } from '../enums';
import { Counter } from './counter.model';

const collectionName = 'Order';

/** ================== Types ================== */
export interface IOrderTimeLineStep {
    date: Date | null;
    message: string;
    status: OrderStatusEnum;
    flag: boolean;
}

export interface IOrderTimeline {
    orderPlaced: IOrderTimeLineStep;
    orderConfirmed: IOrderTimeLineStep;
    processing: IOrderTimeLineStep;
    shipped: IOrderTimeLineStep;
    outForDelivery: IOrderTimeLineStep;
}

export interface IOrderItem {
    product: string; // String _id of Product
    variant: string; // String _id of ProductVariant
    quantity: number;
    price: number;
}

export interface IOrder /* extends Document (provided by mongoose typings) */ {
    _id: string;
    user: string; // String _id of User
    items: IOrderItem[];
    shippingFee: number;
    subTotal: number;
    tax: number;
    discount?: number;
    total: number;
    shippingAddress: string; // String _id of Address
    billingAddress?: string; // (optional) String _id of Address
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

/** ================== Sub-schemas ================== */
const OrderTimelineStepSchema = new Schema<IOrderTimeLineStep>(
    {
        date: { type: Date, default: Date.now }, // Use function, not Date.now()
        message: { type: String, required: true },
        status: { type: String, enum: Object.values(OrderStatusEnum), required: true },
        flag: { type: Boolean, default: false },
    },
    { _id: false }
);

const OrderTimelineSchema = new Schema<IOrderTimeline>(
    {
        orderPlaced: { type: OrderTimelineStepSchema, required: true },
        orderConfirmed: { type: OrderTimelineStepSchema, required: true },
        processing: { type: OrderTimelineStepSchema, required: true },
        shipped: { type: OrderTimelineStepSchema, required: true },
        outForDelivery: { type: OrderTimelineStepSchema, required: true },
    },
    { _id: false }
);

/** ================== Main Schema ================== */
const OrderSchema = new Schema<IOrder, OrderModel, IOrderMethods>(
    {
        _id: { type: String },

        user: {
            type: String,
            ref: 'User',
            required: true,
            index: true,
        },

        items: [
            new Schema<IOrderItem>(
                {
                    product: {
                        type: String,
                        ref: 'Product',
                        required: true,
                        index: true,
                    },
                    variant: {
                        type: String,
                        ref: 'ProductVariant',
                        required: true,
                        index: true,
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
                { _id: false }
            ),
        ],

        shippingFee: {
            type: Number,
            min: 0,
            default: 0,
        },

        subTotal: {
            type: Number,
            required: true,
            min: 0,
        },

        tax: {
            type: Number,
            min: 0,
            default: 0,
        },

        discount: {
            type: Number,
            min: 0,
            default: 0,
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

        billingAddress: {
            type: String,
            ref: 'Address',
            default: undefined,
        },

        razorpayOrderId: {
            type: String,
            trim: true,
        },

        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethodTypeEnum),
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(OrderStatusEnum),
            default: OrderStatusEnum.PENDING,
            index: true,
        },

        trackingNumber: {
            type: String,
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
        },

        orderTimeline: {
            type: OrderTimelineSchema,
            default: () => ({
                orderPlaced: {
                    date: undefined, // will default to Date.now via sub-schema
                    message: 'Your Order has been Placed',
                    status: OrderStatusEnum.PLACED,
                    flag: true,
                },
                orderConfirmed: {
                    date: null,
                    message: 'Your Order has been Confirmed',
                    status: OrderStatusEnum.CONFIRMED,
                    flag: false,
                },
                processing: {
                    date: null,
                    message: 'Your Order Is Processing',
                    status: OrderStatusEnum.PROCESSING,
                    flag: false,
                },
                shipped: {
                    date: null,
                    message: 'Your Order has been Shipped',
                    status: OrderStatusEnum.SHIPPED,
                    flag: false,
                },
                outForDelivery: {
                    date: null,
                    message: 'Your Order is Out for Delivery',
                    status: OrderStatusEnum.OUT_FOR_DELIVERY,
                    flag: false,
                },
            }),
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

/** ================== Hooks ================== */
OrderSchema.pre('save', async function (next) {
    // skip ID generation during migrations if you like
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

async function generateUniqueId(): Promise<string> {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await Order.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
}

/** ================== Indexes (optional but useful) ================== */
// Speed up queries by user + createdAt
OrderSchema.index({ user: 1, createdAt: -1 });
// Speed up status filtering
OrderSchema.index({ status: 1, createdAt: -1 });

/** ================== Model ================== */
export const Order = model<IOrder, OrderModel>(collectionName, OrderSchema);
