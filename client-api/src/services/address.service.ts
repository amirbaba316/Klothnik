import { AddressTypeEnum } from '@klothnick/shared/enums';
import { Address, IAddress, IUser } from '@klothnick/shared/models';
import { NotFoundError } from '@hyperflake/http-errors';

export default class AddressService {
    /**
     *  @desc   Get all addresses of the user
     */
    async getAll(params: { user: IUser }) {
        const { user } = params;

        const addresses = await Address.find({ user: user._id }).sort({
            isDefault: -1,
            createdAt: -1,
        });

        return addresses.map((a) => a.toObject());
    }

    /**
     *  @desc   Create a new address for user
     */
    async create(params: {
        user: IUser;
        type: string;
        firstName: string;
        lastName: string;
        company?: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
        isDefault?: boolean;
    }) {
        const {
            user,
            type,
            firstName,
            lastName,
            company,
            address1,
            address2,
            city,
            state,
            zipCode,
            country,
            phone,
            isDefault = false,
        } = params;

        if (isDefault) {
            await Address.updateMany({ user: user._id, type }, { $set: { isDefault: false } });
        }

        const address = await Address.create({
            user: user._id,
            type,
            firstName,
            lastName,
            company,
            address1,
            address2,
            city,
            state,
            zipCode,
            country,
            phone,
            isDefault,
        });

        return address.toObject();
    }

    /**
     *  @desc   Update an existing address of the user
     */
    async update(params: {
        user: IUser;
        addressId: string;
        type?: string;
        firstName?: string;
        lastName?: string;
        company?: string;
        address1?: string;
        address2?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        phone?: string;
        isDefault?: boolean;
    }) {
        const {
            user,
            addressId,
            type,
            firstName,
            lastName,
            company,
            address1,
            address2,
            city,
            state,
            zipCode,
            country,
            phone,
            isDefault,
        } = params;

        const address = await Address.findOne({ _id: addressId, user: user._id });
        if (!address) throw new NotFoundError('Address not found');

        if (isDefault && type) {
            await Address.updateMany(
                {
                    user: user._id,
                    type,
                    _id: { $ne: addressId },
                },
                { $set: { isDefault: false } }
            );
        }

        if (type !== undefined) address.type = type as AddressTypeEnum;
        if (firstName !== undefined) address.firstName = firstName;
        if (lastName !== undefined) address.lastName = lastName;
        if (company !== undefined) address.company = company;
        if (address1 !== undefined) address.address1 = address1;
        if (address2 !== undefined) address.address2 = address2;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (zipCode !== undefined) address.zipCode = zipCode;
        if (country !== undefined) address.country = country;
        if (phone !== undefined) address.phone = phone;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await address.save();

        return address.toObject();
    }

    /**
     *  @desc   Delete an address
     */
    async remove(params: { user: IUser; addressId: string }) {
        const { user, addressId } = params;

        const address = await Address.findOne({ _id: addressId, user: user._id });
        if (!address) throw new NotFoundError('Address not found');

        await address.deleteOne();
    }
}
