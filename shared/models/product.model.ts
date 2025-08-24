import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import { Counter } from './counter.model'; // for generating unique IDs

const collectionName = 'Product';

export interface IProductOption {
    name: string;
    values: string[];
}

export interface IProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    costPerItem?: number;
    sku: string;
    rating: number;
    size: string;
    barcode?: string;
    quantity: number;
    weight?: number;
    category: string;
    images: string[];
    imageUrls: string[];
    status: string;
    tags?: string[];
    options?: IProductOption[];
    variants?: string[];
    reviews?: string;
}

export interface IProductMethods {}

export type ProductDocument = HydratedDocument<IProduct, IProductMethods>;

export interface ProductModel extends Model<IProduct, {}, IProductMethods> {}

const ProductSchema = new Schema<IProduct, ProductModel, IProductMethods>(
    {
        _id: {
            type: String,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
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
        rating: {
            type: Number,
            min: 0,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
        },
        barcode: {
            type: String,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        weight: {
            type: Number,
            min: 0,
        },
        size: {
            type: String,
        },
        category: {
            type: String,
            ref: 'Category',
            required: true,
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        status: {
            type: String,
            default: 'Active',
        },
        tags: [
            {
                type: String,
            },
        ],
        options: [
            {
                name: {
                    type: String,
                    required: true,
                },
                values: {
                    type: [String],
                    required: true,
                },
            },
        ],
        variants: [
            {
                type: String,
                ref: 'ProductVariant',
            },
        ],
        reviews: {
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

ProductSchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await Product.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
};

export const Product = model<IProduct, ProductModel>(collectionName, ProductSchema);
