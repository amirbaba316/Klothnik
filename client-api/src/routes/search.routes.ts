import express from 'express';
import auth from '../middlewares/auth';
import ProductService from '../services/product.service';

const productService = new ProductService();

const router = express.Router();

/**
 *  @method             GET
 *  @desc               Search users, cameras, project
 *  @access             private
 */

router.get('/:searchParam', [auth], async (req, res) => {
    const { searchParam } = req.params;

    const searchQuery = req.query.q.toString();

    let searchResults: any = [];

    if (searchParam === 'products') {
        searchResults = await productService.searchProduct({
            searchQuery: searchQuery,
            user: req.user,
        });
    }

    res.send(searchResults);
});

export default router;
