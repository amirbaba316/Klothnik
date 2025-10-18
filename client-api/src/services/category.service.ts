import { NotFoundError } from '@hyperflake/http-errors';
import { Category } from '@klothnick/shared/models';
import { StorageClient } from '@klothnick/shared/storage-client/aws-storage-client';

export default class CategoryService {
    private storageClient = new StorageClient();

    /**
     *  @desc   Get all categories
     */
    async getAll() {
        const categories = await Category.find({ status: 'Active' }).sort({ name: 1 });

        return Promise.all(
            categories.map(async (cat) => {
                const obj = cat.toObject();
                if (obj.image) {
                    obj.imageUrl = await this.storageClient.getSignedUrlForGetObject({
                        bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                        key: obj.image,
                    });
                }
                return obj;
            })
        );
    }

    /**
     *  @desc   Get category by ID
     */
    async getById(params: { categoryId: string }) {
        const { categoryId } = params;
        const category = await Category.findById(categoryId).populate({ path: 'variants' });

        if (!category) throw new NotFoundError('Category not found');

        const obj = category.toObject();
        if (obj.image) {
            obj.imageUrl = await this.storageClient.getSignedUrlForGetObject({
                bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                key: obj.image,
            });
        }

        return obj;
    }
}
