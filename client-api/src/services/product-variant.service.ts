import { ProductVariant, IProductVariant, IUser } from '@klothnick/shared/models';
import { NotFoundError } from '@hyperflake/http-errors';

export default class ProductVariantService {
    async getVariantsByProductId(params: { user: IUser; productId: string }): Promise<IProductVariant[]> {
        const { productId } = params;

        console.log(productId);

        const productVarirants = await ProductVariant.find({ productId }).sort({ createdAt: -1 }).lean();

        console.log(productVarirants);

        return productVarirants;
    }

    async getById(params: { size: string; color: string; user: IUser; variantId: string }): Promise<IProductVariant> {
        const { size, color, variantId } = params;

        const variant = await ProductVariant.findOne({ _id: variantId, size: size, color: color })
            .populate({ path: 'productId' })
            .lean();

        if (!variant) throw new NotFoundError('Product variant not found');

        return variant;
    }
}
