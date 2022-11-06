import Router from 'express';
import categoryRouter from './categoryRouter.js';
import filterRouter from './filterRouter.js';
import productRouter from './productRouter.js';
import newsRouter from './newsRouter.js';
import searchRouter from './searchRouter.js';
import historyController from '../controllers/historyController.js';

const router = new Router();

router.use('/filter', filterRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/search', searchRouter);
router.use('/news', newsRouter);

// other routes
router.get('/history/:url', historyController.getHistoryMap);

export default router;
