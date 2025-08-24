import { Router } from 'express';
import auth from '../middlewares/auth';
import ReviewService from '../services/review.service';

const router = Router();
const reviewService = new ReviewService();

router.post('/', [auth], async (req: any, res: any) => {
    const { product, rating, title, comment } = req.body;
    const review = await reviewService.create(req.user, { product, rating, title, comment });
    res.json(review);
});

router.get('/', [auth], async (req: any, res: any) => {
    const reviews = await reviewService.getAllByUser(req.user);
    res.json(reviews);
});

router.get('/product/:productId', async (req, res) => {
    const reviews = await reviewService.getAllByProduct(req.params.productId);
    res.json(reviews);
});

router.patch('/:id', [auth], async (req: any, res: any) => {
    const { rating, title, comment } = req.body;
    const review = await reviewService.update(req.user, req.params.id, { rating, title, comment });
    res.json(review);
});

router.delete('/:id', [auth], async (req: any, res: any) => {
    await reviewService.delete(req.user, req.params.id);
    res.status(204).send();
});

export default router;
