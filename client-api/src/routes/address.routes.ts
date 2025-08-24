import express from 'express';
import AddressService from '../services/address.service';
import auth from '../middlewares/auth';

const router = express.Router();
const addressService = new AddressService();

/**
 *  @method GET
 *  @desc   Get all addresses for user
 *  @access Private
 */
router.get('/', [auth], async (req: any, res: any) => {
    const addresses = await addressService.getAll({ user: req.user });
    res.send(addresses);
});

/**
 *  @method POST
 *  @desc   Create new address
 *  @access Private
 */
router.post('/', [auth], async (req: any, res: any) => {
    const { type, firstName, lastName, company, address1, address2, city, state, zipCode, country, phone, isDefault } =
        req.body;

    const address = await addressService.create({
        user: req.user,
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

    res.send(address);
});

/**
 *  @method PUT
 *  @desc   Update address
 *  @access Private
 */
router.put('/:addressId', [auth], async (req: any, res: any) => {
    const { type, firstName, lastName, company, address1, address2, city, state, zipCode, country, phone, isDefault } =
        req.body;

    const address = await addressService.update({
        user: req.user,
        addressId: req.params.addressId,
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

    res.send(address);
});

/**
 *  @method DELETE
 *  @desc   Delete address
 *  @access Private
 */
router.delete('/:addressId', [auth], async (req: any, res: any) => {
    await addressService.remove({
        user: req.user,
        addressId: req.params.addressId,
    });

    res.send();
});

export default router;
