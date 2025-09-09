import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { Counter } from './counter.model';
import mongoose from 'mongoose';

const collectionName = 'Category';

export interface ICategory extends Document {
    _id: string;
    name: string;
    description?: string;
    parent?: string;
    image?: string;
    imageUrl?: string;
    status: string;
}

export interface ICategoryMethods {}

export type CategoryDocument = HydratedDocument<ICategory, ICategoryMethods>;

export interface CategoryModel extends Model<ICategory, {}, ICategoryMethods> {}

export const CategorySchema = new Schema<ICategory, CategoryModel, ICategoryMethods>(
    {
        _id: {
            type: String,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            default: '',
        },
        parent: {
            type: String,
            ref: 'Category',
            default: null,
        },
        image: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            default: 'Active',
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

CategorySchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await Category.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
};

export const Category = model<ICategory, CategoryModel>(collectionName, CategorySchema);
