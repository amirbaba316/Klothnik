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

        const query = { _id: variantId };

        if (size) {
            query['size'] = size;
        }
        if (color) {
            query['color'] = color;
        }

        const variant = await ProductVariant.findOne(query).populate({ path: 'productId' }).lean();

        if (!variant) throw new NotFoundError('Product variant not found');

        return variant;
    }
}
