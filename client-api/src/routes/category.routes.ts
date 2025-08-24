import express from 'express';
import CategoryService from '../services/category.service';

const router = express.Router();
const categoryService = new CategoryService();

/**
 *  @method GET
 *  @desc   Get all categories
 *  @access Public
 */
router.get('/', async (req, res) => {
    const categories = await categoryService.getAll();
    res.send(categories);
});

/**
 *  @method GET
 *  @desc   Get category by ID
 *  @access Public
 */
router.get('/:categoryId', async (req, res) => {
    const category = await categoryService.getById({ categoryId: req.params.categoryId });
    res.send(category);
});

export default router;
