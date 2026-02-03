import { NotFoundError } from '@hyperflake/http-errors';
import { ProductVariant, Product } from '@klothnick/shared/models';
import { IProductVariant } from '@klothnick/shared/models';

type CreateVariantInput = Omit<IProductVariant, '_id'>;
type UpdateVariantInput = Partial<Omit<IProductVariant, '_id' | 'productId'>>;

export default class ProductVariantService {
    async create(data: CreateVariantInput) {
        // Check if product exists
        const product = await Product.findById(data.productId);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Create variant
        const variant = await ProductVariant.create(data);

        // Add variant to product's variants array
        if (!product.variants) {
            product.variants = [];
        }
        product.variants.push(variant._id);
        await product.save();

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

    async getByProductId(params: { productId: string }) {
        return await ProductVariant.find({ productId: params.productId }).sort({
            createdAt: -1,
        });
    }

    async update(params: { variantId: string; productId: string; updates: UpdateVariantInput }) {
        const variant = await ProductVariant.findById(params.variantId);
        if (!variant) {
            throw new NotFoundError('Product variant not found');
        }

        // Verify variant belongs to the product
        if (variant.productId !== params.productId) {
            throw new NotFoundError('Variant does not belong to this product');
        }

        const updated = await ProductVariant.findByIdAndUpdate(params.variantId, params.updates, { new: true });

        return updated!.toObject();
    }

    async delete(params: { variantId: string; productId: string }) {
        const variant = await ProductVariant.findById(params.variantId);
        if (!variant) {
            throw new NotFoundError('Product variant not found');
        }

        // Verify variant belongs to the product
        if (variant.productId !== params.productId) {
            throw new NotFoundError('Variant does not belong to this product');
        }

        // Remove variant from product's variants array
        await Product.findByIdAndUpdate(params.productId, { $pull: { variants: params.variantId } });

        // Delete the variant
        await ProductVariant.findByIdAndDelete(params.variantId);
    }

    async deleteByProductId(productId: string) {
        // Delete all variants for a product (used when product is deleted)
        await ProductVariant.deleteMany({ productId });
    }
}
