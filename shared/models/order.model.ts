import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { OrderStatusEnum, PaymentMethodTypeEnum } from '../enums';
import { Counter } from './counter.model';

const collectionName = 'Order';

export interface IOrderItem {
    product: string;
    variant?: string;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    _id: string;
    user: string;
    orderNumber: string;
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
        orderNumber: {
            type: String,
            required: true,
            unique: true,
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
            this.orderNumber = `ORD-${this._id}`;
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
