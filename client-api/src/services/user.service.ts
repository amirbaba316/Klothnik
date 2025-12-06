import { BadRequestError, NotFoundError } from '@hyperflake/http-errors';
import { IUser, User } from '@klothnick/shared/models';
import { StorageClient } from '@klothnick/shared/storage-client/aws-storage-client';

export default class UserService {
    private storageClient = new StorageClient();

    /**
     * @desc Get logged-in user profile
     */
    async getProfile({ user }: { user: IUser }) {
        const dbUser = await User.findById(user._id);
        if (!dbUser) throw new NotFoundError('User not found');

        const obj = dbUser.toObject();

        if (obj.image) {
            obj.imageUrl = await this.storageClient.getSignedUrlForGetObject({
                bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                key: obj.image,
            });
        }

        return obj;
    }

    /**
     * @desc Update logged-in user profile
     */
    async updateProfile(params: {
        user: IUser;
        firstName?: string;
        lastName?: string;
        gender: string;
        phone?: string;
    }) {
        const { user, firstName, lastName, phone, gender } = params;

        console.log(params);

        const dbUser = await User.findById(user._id);
        if (!dbUser) throw new NotFoundError('User not found');

        if (firstName !== undefined) dbUser.firstName = firstName;
        if (lastName !== undefined) dbUser.lastName = lastName;
        if (phone !== undefined) dbUser.phone = phone;
        if (gender !== undefined) dbUser.gender = gender;

        await dbUser.save();

        const obj = dbUser.toObject();

        if (obj.image) {
            obj.imageUrl = await this.storageClient.getSignedUrlForGetObject({
                bucket: process.env.AWS_MEDIA_BUCKET_NAME!,
                key: obj.image,
            });
        }

        return obj;
    }

    /**
     * @desc Delete logged-in user profile
     */
    async deleteProfile(params: { user: IUser }) {
        const { user } = params;

        const dbUser = await User.findById(user._id);
        if (!dbUser) throw new NotFoundError('User not found');

        dbUser.isActive = false;

        await dbUser.save();

        return;
    }
}
