import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { Counter } from './counter.model';
import { AddressTypeEnum } from '../enums';

const collectionName = 'Address';

export interface IAddress extends Document {
    _id: string;
    user: string;
    type: AddressTypeEnum;
    company?: string;
    houseNo: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface IAddressMethods {}

export type AddressDocument = HydratedDocument<IAddress, IAddressMethods>;

export interface AddressModel extends Model<IAddress, {}, IAddressMethods> {}

const AddressSchema = new Schema<IAddress, AddressModel, IAddressMethods>(
    {
        _id: {
            type: String,
        },
        user: {
            type: String,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(AddressTypeEnum),
            required: true,
        },
        company: {
            type: String,
            trim: true,
        },
        houseNo: {
            type: String,
            required: true,
            trim: true,
        },
        locality: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
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

AddressSchema.pre('save', async function (next) {
    if (process.env.MODE !== 'migration') {
        if (this.isNew) {
            this._id = await generateUniqueId();
        }
    }
    next();
});

const generateUniqueId = async (): Promise<string> => {
    const uniqueId = await Counter.getNextIdFor(collectionName);
    const exists = await Address.exists({ _id: uniqueId });
    if (!exists) return uniqueId;
    return generateUniqueId();
};

export const Address = model<IAddress, AddressModel>(collectionName, AddressSchema);
