import { Schema, model, Model, Types } from 'mongoose';
import { PaymentMethodTypeEnum, PaymentStatusEnum } from '../enums';
import { Counter } from './counter.model';

const COLLECTION_NAME = 'Payment';

export interface IPayment {
    _id: string;
    order: string;
    user: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethodTypeEnum;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: PaymentStatusEnum;
    paymentDate: Date;
    refundedAmount?: number;
    billingAddress?: Types.ObjectId;
}

export interface IPaymentMethods {}

export interface PaymentModel extends Model<IPayment, {}, IPaymentMethods> {}

export const PaymentSchema = new Schema<IPayment, PaymentModel, IPaymentMethods>(
    {
        _id: {
            type: String,
        },
        order: {
            type: String,
            ref: 'Order',
            required: true,
        },
        user: {
            type: String,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: 'INR',
            uppercase: true,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethodTypeEnum),
            required: true,
        },
        razorpayOrderId: {
            type: String,
            required: true,
            index: true,
        },
        razorpayPaymentId: {
            type: String,
            unique: true,
            sparse: true,
        },
        razorpaySignature: {
            type: String,
        },
        status: {
            type: String,
            enum: Object.values(PaymentStatusEnum),
            default: PaymentStatusEnum.PENDING,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        refundedAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        billingAddress: {
            type: Schema.Types.ObjectId,
            ref: 'Address',
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: COLLECTION_NAME,
    }
);

// Custom ID generation before save
PaymentSchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration' && this.isNew) {
        this._id = await generateUniqueId();
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(COLLECTION_NAME);
    const exists = await Payment.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
};

// Indexes
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index(
    { razorpayPaymentId: 1 },
    { unique: true, partialFilterExpression: { razorpayPaymentId: { $exists: true } } }
);

export const Payment = model<IPayment, PaymentModel>('Payment', PaymentSchema);
