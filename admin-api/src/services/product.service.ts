import { NotFoundError } from '@hyperflake/http-errors';
import { Product } from '@klothnick/shared/models';
import { IProduct } from '@klothnick/shared/models';
import { StorageClient } from '@klothnick/shared/storage-client/aws-storage-client';

interface CreateProductParams {
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    costPerItem?: number;
    sku?: string;
    rating?: number;
    size?: string;
    barcode?: string;
    quantity?: number;
    weight?: number;
    category: string;
    status?: string;
    tags?: string[];
    options?: any[];
    variants?: any[];
    reviews?: any[];
    files?: Express.Multer.File[];
}

interface UpdateProductParams extends Partial<CreateProductParams> {
    productId: string;
}

export default class ProductService {
    private storageClient = new StorageClient();

    async create(params: CreateProductParams) {
        const {
            name,
            description,
            price,
            compareAtPrice,
            costPerItem,
            sku,
            rating,
            size,
            barcode,
            quantity,
            weight,
            category,
            status,
            tags,
            options,
            variants,
            reviews,
            files,
        } = params;

        const imageKeys: string[] = [];

        if (files?.length) {
            for (const file of files) {
                const ext = file.originalname.split('.').pop();
                const key = `products/${name}-${Date.now()}.${ext}`;

                await this.storageClient.upload({
                    bucket: process.env.AWS_BUCKET!,
                    key,
                    body: file.buffer,
                    contentType: file.mimetype,
                });

                imageKeys.push(key);
            }
        }

        const product = await Product.create({
            name,
            description,
            price,
            compareAtPrice,
            costPerItem,
            sku,
            rating,
            size,
            barcode,
            quantity,
            weight,
            category,
            status,
            tags,
            options,
            variants,
            reviews,
            images: imageKeys,
        });

        return product.toObject();
    }

    async getAll() {
        const products = await Product.find().populate('category variants').sort({ createdAt: -1 });

        const signedProducts = await Promise.all(
            products.map(async (p) => {
                const product = p.toObject();

                if (Array.isArray(product.images)) {
                    product.imageUrls = await Promise.all(
                        product.images.map((key: string) =>
                            this.storageClient.getSignedUrlForGetObject({
                                bucket: process.env.AWS_BUCKET!,
                                key,
                            })
                        )
                    );
                }

                return product;
            })
        );

        return signedProducts;
    }

    async getById({ productId }: { productId: string }) {
        const product = await Product.findById(productId).populate('category variants');
        if (!product) throw new NotFoundError('Product not found');

        const productObj = product.toObject();

        if (Array.isArray(productObj.images)) {
            productObj.imageUrls = await Promise.all(
                productObj.images.map((key: string) =>
                    this.storageClient.getSignedUrlForGetObject({
                        bucket: process.env.AWS_BUCKET!,
                        key,
                    })
                )
            );
        }

        return productObj;
    }

    async update({
        productId,
        name,
        description,
        price,
        compareAtPrice,
        costPerItem,
        sku,
        rating,
        size,
        barcode,
        quantity,
        weight,
        category,
        status,
        tags,
        options,
        variants,
        reviews,
        files,
    }: UpdateProductParams) {
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError('Product not found');

        let imageKeys = product.images || [];

        if (files?.length) {
            imageKeys = [];
            for (const file of files) {
                const ext = file.originalname.split('.').pop();
                const key = `products/${name || product.name}-${Date.now()}.${ext}`;

                await this.storageClient.upload({
                    bucket: process.env.AWS_BUCKET!,
                    key,
                    body: file.buffer,
                    contentType: file.mimetype,
                });

                imageKeys.push(key);
            }
        }

        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.compareAtPrice = compareAtPrice ?? product.compareAtPrice;
        product.costPerItem = costPerItem ?? product.costPerItem;
        product.sku = sku ?? product.sku;
        product.rating = rating ?? product.rating;
        product.size = size ?? product.size;
        product.barcode = barcode ?? product.barcode;
        product.quantity = quantity ?? product.quantity;
        product.weight = weight ?? product.weight;
        product.category = category ?? product.category;
        product.status = status ?? product.status;
        product.tags = tags ?? product.tags;
        product.options = options ?? product.options;
        product.variants = variants ?? product.variants;
        product.images = imageKeys;

        const updated = await product.save();
        return updated.toObject();
    }

    async delete({ productId }: { productId: string }) {
        const deleted = await Product.findByIdAndDelete(productId);
        if (!deleted) throw new NotFoundError('Product not found');
    }
}
