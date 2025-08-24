import { ProductVariant, IProductVariant, IUser } from '@klothnick/shared/models';
import { NotFoundError } from '@hyperflake/http-errors';

export default class ProductVariantService {
    async getVariantsByProductId(params: { user: IUser; productId: string }): Promise<IProductVariant[]> {
        const { productId } = params;

        return await ProductVariant.find({ productId }).sort({ createdAt: -1 }).lean();
    }

    async getById(params: { user: IUser; variantId: string }): Promise<IProductVariant> {
        const { variantId } = params;

        const variant = await ProductVariant.findById(variantId).lean();

        if (!variant) throw new NotFoundError('Product variant not found');

        return variant;
    }
}
