import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { Counter } from './counter.model';

const collectionName = 'Cart';

export interface ICartItem {
    product: string;
    variant: string;
    quantity: number;
}

export interface ICart extends Document {
    _id: string;
    user: string;
    items: ICartItem[];
    expiresAt: Date;
}

export interface ICartMethods {}

export type CartDocument = HydratedDocument<ICart, ICartMethods>;

export interface CartModel extends Model<ICart, {}, ICartMethods> {}

const CartSchema = new Schema<ICart, CartModel, ICartMethods>(
    {
        _id: {
            type: String,
        },
        user: {
            type: String,
            ref: 'User',
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
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
            },
        ],
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

CartSchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await Cart.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
};

export const Cart = model<ICart, CartModel>(collectionName, CartSchema);
