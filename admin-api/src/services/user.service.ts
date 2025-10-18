import { NotFoundError } from '@hyperflake/http-errors';
import { User } from '@klothnick/shared/models';
import { UserRoleEnum, UserStatusEnum } from '@klothnick/shared/enums';
import { StorageClient } from '@klothnick/shared/storage-client/aws-storage-client';

interface UpdateUserParams {
    userId: string;
    role?: UserRoleEnum;
    status?: UserStatusEnum;
    isActive?: boolean;
    file?: Express.Multer.File;
}

export default class UserService {
    private storageClient = new StorageClient();

    async getAll(params: { role?: UserRoleEnum }) {
        const users = await User.find(params.role ? { role: params.role } : {})
            .populate('addresses paymentMethods')
            .sort({ createdAt: -1 });

        return Promise.all(users.map((u) => this.appendSignedUrl(u.toObject())));
    }

    async getById(params: { userId: string }) {
        const user = await User.findById(params.userId).populate('addresses paymentMethods');
        if (!user) throw new NotFoundError('User not found');
        return this.appendSignedUrl(user.toObject());
    }

    async update(params: UpdateUserParams) {
        const { userId, role, status, isActive, file } = params;

        let imageKey: string | undefined;

        if (file) {
            const ext = file.originalname.split('.').pop();
            imageKey = `users/${userId}-${Date.now()}.${ext}`;

            await this.storageClient.upload({
                bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                key: imageKey,
                body: file.buffer,
                contentType: file.mimetype,
            });
        }

        const updated = await User.findByIdAndUpdate(
            userId,
            {
                ...(role && { role }),
                ...(status && { status }),
                ...(typeof isActive === 'boolean' && { isActive }),
                ...(imageKey && { image: imageKey }),
            },
            { new: true }
        ).populate('addresses paymentMethods');

        if (!updated) throw new NotFoundError('User not found');

        return this.appendSignedUrl(updated.toObject());
    }

    async delete(params: { userId: string }) {
        const deleted = await User.findByIdAndDelete(params.userId);
        if (!deleted) throw new NotFoundError('User not found');
    }

    private async appendSignedUrl(user: any) {
        if (user.image) {
            user.imageUrl = await this.storageClient.getSignedUrlForGetObject({
                bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                key: user.image,
            });
        }
        return user;
    }
}
