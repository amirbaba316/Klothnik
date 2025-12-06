import { HydratedDocument, model, Model, Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import { Counter } from './counter.model';
import { UserStatusEnum, UserRoleEnum } from '../enums';

const collectionName = 'User';

export interface IUser extends Document {
    _id: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    gender?: string;
    image?: string;
    role?: UserRoleEnum;
    status?: UserStatusEnum;
    isActive?: boolean;
    imageUrl?: string;
    lastLogin?: Date;
    addresses?: string[];
    paymentMethods?: string[];
}

export interface IUserMethods {
    fullName(): string;
    generateAuthToken(): Promise<string>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

export interface UserModel extends Model<IUser, {}, IUserMethods> {}

export const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        _id: {
            type: String,
        },
        firstName: {
            type: String,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        gender: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: Object.values(UserRoleEnum),
            default: UserRoleEnum.CUSTOMER,
        },
        status: {
            type: String,
            enum: Object.values(UserStatusEnum),
            default: UserStatusEnum.ENABLED,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
        addresses: [
            {
                type: String,
                ref: 'Address',
            },
        ],
        paymentMethods: [
            {
                type: String,
                ref: 'PaymentMethod',
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
        minimize: false,
        collection: collectionName,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
    }
);

UserSchema.methods.fullName = function () {
    return `${this.firstName} ${this.lastName}`;
};

UserSchema.methods.generateAuthToken = async function () {
    const payload = {
        _id: this._id,
        role: this.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '365d',
    });
};

UserSchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await User.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
};

export const User = model<IUser, UserModel>(collectionName, UserSchema);
