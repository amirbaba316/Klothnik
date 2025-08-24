import { Schema, model, Model, Types } from 'mongoose';
import { Counter } from './counter.model'; // for generating unique IDs

const collectionName = 'Review';

export interface IReview {
    _id: String;
    user: Types.ObjectId;
    product: Types.ObjectId;
    rating: number;
    title?: string;
    comment?: string;
    isApproved: boolean;
}

export interface IReviewMethods {}

export interface ReviewModel extends Model<IReview, {}, IReviewMethods> {}

export const ReviewSchema = new Schema<IReview, ReviewModel, IReviewMethods>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
        },
        comment: {
            type: String,
            trim: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
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

// Auto-generate string ID
ReviewSchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await Review.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId(); // retry
};

export const Review = model<IReview, ReviewModel>('Review', ReviewSchema);
