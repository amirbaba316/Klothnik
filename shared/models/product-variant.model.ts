import { Schema, model, Model, Types } from 'mongoose';
import { ProductVariantStatusEnum } from '../enums';
import { Counter } from './counter.model'; // for _id generation

const collectionName = 'ProductVariant';

export interface IProductVariant {
    _id: string; // using string ID
    productId: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    costPerItem?: number;
    barcode?: string;
    quantity: number;
    weight?: number;
    size: string;
    color: string;
    image?: string;
    status: ProductVariantStatusEnum;
}

export interface IProductVariantMethods {}

export interface ProductVariantModel extends Model<IProductVariant, {}, IProductVariantMethods> {}

export const ProductVariantSchema = new Schema<IProductVariant, ProductVariantModel, IProductVariantMethods>(
    {
        _id: {
            type: String,
            required: true,
        },
        productId: {
            type: String,
            ref: 'Product',
            required: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        compareAtPrice: {
            type: Number,
            min: 0,
        },
        costPerItem: {
            type: Number,
            min: 0,
        },
        barcode: {
            type: String,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        weight: {
            type: Number,
            min: 0,
        },
        size: {
            type: String,
        },
        color: {
            type: String,
        },
        image: {
            type: String,
        },
        status: {
            type: String,
            enum: Object.values(ProductVariantStatusEnum),
            default: ProductVariantStatusEnum.ACTIVE,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'ProductVariant',
    }
);

// Generate string _id automatically unless in migration mode
ProductVariantSchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await ProductVariant.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
};

export const ProductVariant = model<IProductVariant, ProductVariantModel>('ProductVariant', ProductVariantSchema);
