import express from 'express';
import multer from 'multer';
import CategoryService from '../services/category.service';

const upload = multer();
const router = express.Router();
const categoryService = new CategoryService();

/**
 *  @method POST
 *  @desc   Create a new category
 *  @access Admin
 */
router.post('/', upload.single('file'), async (req, res) => {
    const { name, description, parent, status } = req.body;
    const file = req.file as Express.Multer.File;

    const category = await categoryService.create({
        name,
        description,
        parent,
        status,
        file,
    });

    res.send(category);
});

/**
 *  @method GET
 *  @desc   Get all categories
 *  @access Admin
 */
router.get('/', async (req, res) => {
    const categories = await categoryService.getAll();
    res.send(categories);
});

/**
 *  @method GET
 *  @desc   Get category by ID
 *  @access Admin
 */
router.get('/:categoryId', async (req, res) => {
    const category = await categoryService.getById({ categoryId: req.params.categoryId });
    res.send(category);
});

/**
 *  @method PUT
 *  @desc   Update category by ID
 *  @access Admin
 */
router.put('/:categoryId', upload.single('file'), async (req, res) => {
    const { name, description, parent, image, status } = req.body;
    const file = req.file as Express.Multer.File;

    const updated = await categoryService.update({
        categoryId: req.params.categoryId,
        updates: { name, description, parent, image, status },
        file,
    });

    res.send(updated);
});

/**
 *  @method DELETE
 *  @desc   Delete category by ID
 *  @access Admin
 */
router.delete('/:categoryId', async (req, res) => {
    await categoryService.delete({ categoryId: req.params.categoryId });
    res.send({ success: true });
});

export default router;
