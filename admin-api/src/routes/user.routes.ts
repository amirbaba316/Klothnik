import express from 'express';
import multer from 'multer';
import UserService from '../services/user.service';
import { UserRoleEnum } from '@klothnick/shared/enums';

const router = express.Router();
const userService = new UserService();
const upload = multer();

// Helper to ensure string params
const getStringParam = (param: string | string[]): string => {
    return Array.isArray(param) ? param[0] : param;
};

/**
 * GET /admin-api/users
 * Get all users
 */
router.get('/', async (req, res) => {
    const { role } = req.query;
    const users = await userService.getAll({ role: role as UserRoleEnum });
    res.send(users);
});

/**
 * GET /admin-api/users/:userId
 * Get a user by ID
 */
router.get('/:userId', async (req, res) => {
    const user = await userService.getById({
        userId: getStringParam(req.params.userId),
    });
    res.send(user);
});

/**
 * PUT /admin-api/users/:userId
 * Update a user (with image)
 */
router.put('/:userId', upload.single('file'), async (req, res) => {
    const { role, status, isActive } = req.body;

    const user = await userService.update({
        userId: getStringParam(req.params.userId),
        role,
        status,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        file: req.file as Express.Multer.File,
    });

    res.send(user);
});

/**
 * DELETE /admin-api/users/:userId
 * Delete a user
 */
router.delete('/:userId', async (req, res) => {
    await userService.delete({
        userId: getStringParam(req.params.userId),
    });
    res.send({ success: true });
});

export default router;
