import { NotFoundError } from '@hyperflake/http-errors';
import { Product } from '@klothnick/shared/models';
import { StorageClient } from '@klothnick/shared/storage-client/aws-storage-client'; // Update the path if needed

export default class ProductService {
    private storageClient = new StorageClient();
    async getAll(params: { query: any }) {
        const { category, tag, status } = params.query;
        const filters: any = {};

        if (category) filters.category = category;
        if (tag) filters.tags = tag;
        if (status) filters.status = status;

        const products = await Product.find(filters).sort({ createdAt: -1 });
        return Promise.all(products.map((p) => this.addSignedUrls(p)));
    }

    async getById(params: { productId: string }) {
        const { productId } = params;
        const product = await Product.findById(productId).populate({ path: 'variants' });
        if (!product) throw new NotFoundError('Product not found');
        return this.addSignedUrls(product);
    }

    async search(params: { query: string }) {
        const { query } = params;
        const regex = new RegExp(query, 'i');
        const results = await Product.find({
            $or: [{ name: regex }, { description: regex }],
        }).populate({ path: 'variants' });
        return Promise.all(results.map((p) => this.addSignedUrls(p)));
    }

    async getAllProducts(params: { query: any }) {
        const { tag, status } = params.query;
        const filters: any = {};

        if (tag) filters.tags = tag;
        if (status) filters.status = status;

        const products = await Product.find(filters).sort({ createdAt: -1 });
        return Promise.all(products.map((p) => this.addSignedUrls(p)));
    }

    async getAllProductsById(params: { productId: string }) {
        const { productId } = params;
        const product = await Product.findById(productId).populate({ path: 'variants' });
        if (!product) throw new NotFoundError('Product not found');
        return this.addSignedUrls(product);
    }

    private async addSignedUrls(product: any) {
        const obj = product.toObject();

        if (Array.isArray(obj.images)) {
            obj.imageUrls = await Promise.all(
                obj.images.map((key: string) =>
                    this.storageClient.getSignedUrlForGetObject({
                        bucket: process.env.AWS_BUCKET!,
                        key,
                    })
                )
            );
        }

        return obj;
    }
}
