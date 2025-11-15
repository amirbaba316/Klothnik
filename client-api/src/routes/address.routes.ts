import express from 'express';
import auth from '../middlewares/auth';
import AddressService from '../services/address.service';

const router = express.Router();
const addressService = new AddressService();

/**
 *  @method POST
 *  @desc   Create a new address
 *  @access Private
 */
router.post('/', [auth], async (req: any, res: any) => {
    const { phone, houseNo, locality, city, state, pincode, country, type, isDefault } = req.body;
    const address = await addressService.create({
        user: req.user,
        phone,
        houseNo,
        locality,
        city,
        state,
        pincode,
        country,
        type,
        isDefault,
    });
    res.send(address);
});

/**
 *  @method GET
 *  @desc   Get all addresses of a user
 *  @access Private
 */
router.get('/', [auth], async (req: any, res: any) => {
    const addresses = await addressService.getAll({ user: req.user });
    res.send(addresses);
});

/**
 *  @method GET
 *  @desc   Get a single address by ID
 *  @access Private
 */
router.get('/:id', [auth], async (req: any, res: any) => {
    const address = await addressService.getById({
        user: req.user,
        addressId: req.params.id,
    });
    res.send(address);
});

/**
 *  @method PUT
 *  @desc   Update an address
 *  @access Private
 */
router.put('/:id', [auth], async (req: any, res: any) => {
    const { phone, houseNo, locality, city, state, pincode, country, type, isDefault } = req.body;
    const address = await addressService.update({
        user: req.user,
        addressId: req.params.id,
        phone,
        houseNo,
        locality,
        city,
        state,
        pincode,
        country,
        type,
        isDefault,
    });
    res.send(address);
});

/**
 *  @method DELETE
 *  @desc   Delete an address
 *  @access Private
 */
router.delete('/:id', [auth], async (req: any, res: any) => {
    await addressService.delete({
        user: req.user,
        addressId: req.params.id,
    });
    res.send();
});

/**
 *  @method PATCH
 *  @desc   Set an address as default
 *  @access Private
 */
router.patch('/:id/set-default', [auth], async (req: any, res: any) => {
    const address = await addressService.setDefault({
        user: req.user,
        addressId: req.params.id,
    });
    res.send(address);
});

export default router;
