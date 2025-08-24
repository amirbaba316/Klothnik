import { NotFoundError } from '@hyperflake/http-errors';
import { Category } from '@klothnick/shared/models';
import { StorageClient } from '@klothnick/shared/storage-client/aws-storage-client';

export default class CategoryService {
    private storageClient = new StorageClient();

    async create(params: {
        name: string;
        description?: string;
        parent?: string;
        file?: Express.Multer.File;
        status?: string;
    }) {
        const { name, description, parent, file, status } = params;

        let imageKey: string | undefined;

        if (file) {
            const ext = file.originalname.split('.').pop();
            const key = `categories/${name}-${Date.now()}.${ext}`;

            await this.storageClient.upload({
                bucket: process.env.AWS_BUCKET!,
                key,
                body: file.buffer,
                contentType: file.mimetype,
            });

            imageKey = key;
        }

        const category = await Category.create({
            name,
            description,
            parent,
            status,
            image: imageKey,
        });

        const obj = category.toObject();
        if (obj.image) {
            obj.imageUrl = await this.getSignedUrl(obj.image);
        }

        return obj;
    }

    async getAll() {
        const categories = await Category.find().sort({ createdAt: -1 });
        return Promise.all(
            categories.map(async (cat) => {
                const obj = cat.toObject();
                if (obj.image) {
                    obj.imageUrl = await this.getSignedUrl(obj.image);
                }
                return obj;
            })
        );
    }

    async getById(params: { categoryId: string }) {
        const category = await Category.findById(params.categoryId);
        if (!category) throw new NotFoundError('Category not found');

        const obj = category.toObject();
        if (obj.image) {
            obj.imageUrl = await this.getSignedUrl(obj.image);
        }

        return obj;
    }

    async update(params: {
        categoryId: string;
        updates: {
            name?: string;
            description?: string;
            parent?: string;
            image?: string;
            status?: string;
        };
        file?: Express.Multer.File;
    }) {
        const { categoryId, updates, file } = params;

        if (file) {
            const ext = file.originalname.split('.').pop();
            const key = `categories/${updates.name || 'category'}-${Date.now()}.${ext}`;

            await this.storageClient.upload({
                bucket: process.env.AWS_BUCKET!,
                key,
                body: file.buffer,
                contentType: file.mimetype,
            });

            updates.image = key;
        }

        const updated = await Category.findByIdAndUpdate(categoryId, updates, {
            new: true,
        });

        if (!updated) throw new NotFoundError('Category not found');

        const obj = updated.toObject();
        if (obj.image) {
            obj.imageUrl = await this.getSignedUrl(obj.image);
        }

        return obj;
    }

    async delete(params: { categoryId: string }) {
        const deleted = await Category.findByIdAndDelete(params.categoryId);
        if (!deleted) throw new NotFoundError('Category not found');
    }

    private async getSignedUrl(key: string): Promise<string> {
        return this.storageClient.getSignedUrlForGetObject({
            bucket: process.env.AWS_BUCKET!,
            key,
        });
    }
}
