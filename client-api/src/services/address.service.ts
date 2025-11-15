import { Address, IAddress, IUser } from '@klothnick/shared/models';
import { AddressTypeEnum } from '@klothnick/shared/enums';
import { BadRequestError, NotFoundError } from '@hyperflake/http-errors';
import mongoose from 'mongoose';

export default class AddressService {
    async create(params: {
        user: IUser;
        phone?: string;
        houseNo: string;
        locality?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
        type?: AddressTypeEnum;
        isDefault?: boolean;
    }) {
        const { user, phone, houseNo, locality, city, state, pincode, country, type } = params;

        let { isDefault } = params;

        // If this address is set as default, unset other defaults
        if (isDefault) {
            await Address.updateMany({ user: user._id, isDefault: true }, { $set: { isDefault: false } });
        }

        // If this is the first address, make it default automatically
        const existingCount = await Address.countDocuments({ user: user._id });
        isDefault = isDefault !== undefined ? isDefault : existingCount === 0;

        const address = await Address.create({
            user: user._id,
            phone: phone,
            houseNo: houseNo,
            locality: locality,
            city: city,
            state: state,
            pincode: pincode,
            country: country,
            type: type || AddressTypeEnum.HOME,
            isDefault,
        });

        return address;
    }

    async getAll(params: { user: IUser }) {
        return await Address.find({ user: params.user._id }).sort({ isDefault: -1, createdAt: -1 });
    }

    async getById(params: { user: IUser; addressId: string }) {
        const { user, addressId } = params;

        const address = await Address.findOne({ _id: addressId, user: user._id });
        if (!address) {
            throw new NotFoundError('Address not found');
        }

        return address.toObject();
    }

    async update(params: {
        user: IUser;
        addressId: string;
        phone?: string;
        houseNo: string;
        locality?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
        type?: AddressTypeEnum;
        isDefault?: boolean;
    }) {
        const { user, phone, houseNo, locality, city, state, pincode, country, type, addressId } = params;

        let { isDefault } = params;

        const address = await Address.findOne({ _id: addressId, user: user._id });
        if (!address) {
            throw new NotFoundError('Address not found');
        }

        // If setting this address as default, unset other defaults
        if (isDefault === true) {
            await Address.updateMany(
                { user: user._id, _id: { $ne: addressId }, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        // If unsetting default, ensure at least one address remains default
        if (isDefault === false && address.isDefault) {
            const otherAddresses = await Address.findOne({
                user: user._id,
                _id: { $ne: addressId },
            });

            if (otherAddresses) {
                otherAddresses.isDefault = true;
                await otherAddresses.save();
            } else {
                throw new BadRequestError('Cannot unset default address when it is the only address');
            }
        }

        address.phone = phone;
        address.houseNo = houseNo;
        address.locality = locality;
        address.city = city;
        address.state = state;
        address.pincode = pincode;
        address.country = country;
        address.type = type;

        return address;
    }

    async delete(params: { user: IUser; addressId: string }) {
        const { user, addressId } = params;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const address = await Address.findOne({ _id: addressId, user: user._id }).session(session);
            if (!address) {
                throw new NotFoundError('Address not found');
            }

            // If deleting the default address, set another address as default
            if (address.isDefault) {
                const anotherAddress = await Address.findOne({
                    user: user._id,
                    _id: { $ne: addressId },
                }).session(session);

                if (anotherAddress) {
                    anotherAddress.isDefault = true;
                    await anotherAddress.save({ session });
                }
            }

            await Address.deleteOne({ _id: addressId }).session(session);

            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }

        return;
    }

    async setDefault(params: { user: IUser; addressId: string }) {
        const { user, addressId } = params;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const address = await Address.findOne({ _id: addressId, user: user._id }).session(session);
            if (!address) {
                throw new NotFoundError('Address not found or access denied');
            }

            // Unset all other default addresses
            await Address.updateMany(
                { user: user._id, _id: { $ne: addressId }, isDefault: true },
                { $set: { isDefault: false } }
            ).session(session);

            // Set this address as default
            address.isDefault = true;
            await address.save({ session });

            await session.commitTransaction();
            return address.toObject();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }
}
