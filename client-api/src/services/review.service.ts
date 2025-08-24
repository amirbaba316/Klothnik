import { Review, IReview, Product } from '@klothnick/shared/models';
import { IUser } from '@klothnick/shared/models';
import { NotFoundError, ForbiddenError } from '@hyperflake/http-errors';

type CreateReviewInput = {
    product: string;
    rating: number;
    title?: string;
    comment?: string;
};

type UpdateReviewInput = {
    rating?: number;
    title?: string;
    comment?: string;
};

export default class ReviewService {
    async create(user: IUser, input: CreateReviewInput) {
        const productExists = await Product.exists({ _id: input.product });
        if (!productExists) throw new NotFoundError('Product not found');

        const review = await Review.create({
            user: user._id,
            product: input.product,
            rating: input.rating,
            title: input.title,
            comment: input.comment,
            isApproved: false,
        });

        return review.toObject();
    }

    async getAllByUser(user: IUser) {
        return await Review.find({ user: user._id }).populate('product').sort({ createdAt: -1 });
    }

    async getAllByProduct(productId: string) {
        return await Review.find({ product: productId, isApproved: true }).populate('user').sort({ createdAt: -1 });
    }

    async update(user: IUser, reviewId: string, input: UpdateReviewInput) {
        const review = await Review.findById(reviewId);
        if (!review) throw new NotFoundError('Review not found');
        if (review.user.toString() !== user._id.toString()) throw new ForbiddenError('Access denied');

        if (input.rating !== undefined) review.rating = input.rating;
        if (input.title !== undefined) review.title = input.title;
        if (input.comment !== undefined) review.comment = input.comment;

        await review.save();
        return review.toObject();
    }

    async delete(user: IUser, reviewId: string) {
        const review = await Review.findById(reviewId);
        if (!review) throw new NotFoundError('Review not found');
        if (review.user.toString() !== user._id.toString()) throw new ForbiddenError('Access denied');

        await Review.deleteOne({ _id: reviewId });
    }
}
