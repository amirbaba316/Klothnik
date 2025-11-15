import express from 'express';
import UserService from '../services/user.service';
import auth from '../middlewares/auth';

const userService = new UserService();
const router = express.Router();

/**
 *  @method GET
 *  @desc   Get logged-in user profile
 *  @access Private
 */
router.get('/', [auth], async (req: any, res: any) => {
    const user = await userService.getProfile({ user: req.user });
    res.send(user);
});

/**
 *  @method PUT
 *  @desc   Update user profile
 *  @access Private
 */
router.put('/', [auth], async (req: any, res: any) => {
    const { firstName, lastName, phone } = req.body; // adjust fields as needed

    const updatedUser = await userService.updateProfile({
        user: req.user,
        firstName,
        lastName,
        phone,
    });

    res.send(updatedUser);
});

/**
 *  @method PUT
 *  @desc   Update user address
 *  @access Private
 */
router.put('/address', [auth], async (req: any, res: any) => {
    const { firstName, lastName, phone } = req.body; // adjust fields as needed

    const updatedUser = await userService.updateAddress({
        user: req.user,
        firstName,
        lastName,
        phone,
    });

    res.send(updatedUser);
});

export default router;
