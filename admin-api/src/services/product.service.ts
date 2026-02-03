import { NotFoundError } from '@hyperflake/http-errors';
import { ProductStatusEnum } from '@klothnick/shared/enums';
import { Product } from '@klothnick/shared/models';
import { IProductOption } from '@klothnick/shared/models';
import { StorageClient } from '@klothnick/shared/storage-client/aws-storage-client';
import ProductVariantService from './product-variant.service';

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
    status?: ProductStatusEnum;
    tags?: string[];
    options?: IProductOption;
    reviews?: any[];
    files?: Express.Multer.File[];
}

interface UpdateProductParams extends Partial<CreateProductParams> {
    productId: string;
}

export default class ProductService {
    private storageClient = new StorageClient();
    private variantService = new ProductVariantService();

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
            reviews,
            files,
        } = params;

        const imageKeys: string[] = [];

        if (files?.length) {
            for (const file of files) {
                const ext = file.originalname.split('.').pop();
                const key = `products/${name}-${Date.now()}.${ext}`;

                await this.storageClient.upload({
                    bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
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
            variants: [], // Initialize empty variants array
            reviews,
            images: imageKeys,
        });

        return product.toObject();
    }

    async getAll() {
        const products = await Product.find().populate('category').populate('variants').sort({ createdAt: -1 });

        const signedProducts = await Promise.all(
            products.map(async (p) => {
                const product = p.toObject();

                if (Array.isArray(product.images) && product.images.length > 0) {
                    product.imageUrls = await Promise.all(
                        product.images.map((key: string) =>
                            this.storageClient.getSignedUrlForGetObject({
                                bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                                key,
                            })
                        )
                    );
                } else {
                    product.imageUrls = [];
                }

                return product;
            })
        );

        return signedProducts;
    }

    async getById({ productId }: { productId: string }) {
        const product = await Product.findById(productId).populate('category').populate('variants');

        if (!product) throw new NotFoundError('Product not found');

        const productObj = product.toObject();

        if (Array.isArray(productObj.images) && productObj.images.length > 0) {
            productObj.imageUrls = await Promise.all(
                productObj.images.map((key: string) =>
                    this.storageClient.getSignedUrlForGetObject({
                        bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                        key,
                    })
                )
            );
        } else {
            productObj.imageUrls = [];
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
        reviews,
        files,
    }: UpdateProductParams) {
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError('Product not found');

        let imageKeys = product.images || [];

        // Only update images if new files are provided
        if (files && files.length > 0) {
            // Delete old images from S3
            if (imageKeys.length > 0) {
                await Promise.all(
                    imageKeys.map(async (key) => {
                        try {
                            await this.storageClient.delete({
                                bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                                key,
                            });
                        } catch (error) {
                            console.error(`Failed to delete image ${key}:`, error);
                        }
                    })
                );
            }

            // Upload new images
            imageKeys = [];
            for (const file of files) {
                const ext = file.originalname.split('.').pop();
                const key = `products/${name}-${Date.now()}.${ext}`;

                await this.storageClient.upload({
                    bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                    key,
                    body: file.buffer,
                    contentType: file.mimetype,
                });

                imageKeys.push(key);
            }
        }

        // Update fields
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
        product.images = imageKeys;
        // Note: We don't update variants array here - it's managed by variant service

        const updated = await product.save();
        return updated.toObject();
    }

    async delete({ productId }: { productId: string }) {
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError('Product not found');

        // Delete all variants first
        await this.variantService.deleteByProductId(productId);

        // Delete images from S3
        if (product.images && product.images.length > 0) {
            await Promise.all(
                product.images.map(async (image) => {
                    try {
                        await this.storageClient.delete({
                            bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                            key: image,
                        });
                    } catch (error) {
                        console.error(`Failed to delete image ${image}:`, error);
                    }
                })
            );
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);
    }
}
