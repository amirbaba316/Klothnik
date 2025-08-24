import { NotFoundError } from '@hyperflake/http-errors';
import { ProductVariant } from '@klothnick/shared/models';
import { IProductVariant } from '@klothnick/shared/models';

type CreateVariantInput = Omit<IProductVariant, '_id'>;
type UpdateVariantInput = Partial<Omit<IProductVariant, '_id'>>;

export default class ProductVariantService {
    async create(data: CreateVariantInput) {
        const variant = await ProductVariant.create(data);
        return variant.toObject();
    }

    async getAll() {
        return await ProductVariant.find().sort({ createdAt: -1 });
    }

    async getById(params: { variantId: string }) {
        const variant = await ProductVariant.findById(params.variantId);
        if (!variant) throw new NotFoundError('Product variant not found');
        return variant.toObject();
    }

    async update(params: { variantId: string; updates: UpdateVariantInput }) {
        const updated = await ProductVariant.findByIdAndUpdate(params.variantId, params.updates, {
            new: true,
        });

        if (!updated) throw new NotFoundError('Product variant not found');
        return updated.toObject();
    }

    async delete(params: { variantId: string }) {
        const deleted = await ProductVariant.findByIdAndDelete(params.variantId);
        if (!deleted) throw new NotFoundError('Product variant not found');
    }
}
