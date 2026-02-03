import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { Counter } from './counter.model';
import { IOrder, IOrderItem } from './order.model';
import { OrderStatusEnum } from '../enums';

const collectionName = 'CancelOrder';

export interface ICancelOrder /* extends Document (provided by mongoose typings) */ {
    _id: string;
    user: string; // String _id of User
    order: string | IOrder;
    reason: string;
    orderStatus: OrderStatusEnum;
}

export interface ICancelOrderMethods {}

export type CancelOrderDocument = HydratedDocument<ICancelOrder, ICancelOrderMethods>;
export interface CancelOrderModel extends Model<ICancelOrder, {}, ICancelOrderMethods> {}

const CancelOrderSchema = new Schema<ICancelOrder, CancelOrderModel, ICancelOrderMethods>(
    {
        _id: { type: String },

        user: {
            type: String,
            ref: 'User',
            required: true,
            index: true,
        },
        order: {
            type: String,
            ref: 'Order',
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        orderStatus: {
            type: String,
            enum: Object.values(OrderStatusEnum),
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
CancelOrderSchema.pre('save', async function (next) {
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
    const exists = await CancelOrder.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
}

/** ================== Model ================== */
export const CancelOrder = model<ICancelOrder, CancelOrderModel>(collectionName, CancelOrderSchema);
