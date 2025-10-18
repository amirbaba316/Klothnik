import { ProductVariant, IProductVariant, IUser } from '@klothnick/shared/models';
import { NotFoundError } from '@hyperflake/http-errors';

export default class ProductVariantService {
    async getVariantsByProductId(params: { user: IUser; productId: string }): Promise<any> {
        const { productId } = params;

        console.log(productId);

        const productVarirants = await ProductVariant.find({ productId }).sort({ createdAt: -1 }).lean();

        let sizeList = [];
        let colorList = [];

        productVarirants.map((productVarirant) => {
            sizeList.push(productVarirant.size);
        });

        return { productVarirants, sizeList: [...new Set(sizeList)] };
    }

    async getById(params: { size: string; color: string; user: IUser; variantId: string }): Promise<IProductVariant> {
        const { size, color, variantId } = params;

        console.log(params);

        const query = { _id: variantId };

        if (size) {
            query['size'] = size;
        }
        if (color) {
            query['color'] = color;
        }

        console.log(query);

        const variant = await ProductVariant.findOne(query).populate({ path: 'productId' }).lean();

        if (!variant) throw new NotFoundError('Product variant not found');

        return variant;
    }
}
