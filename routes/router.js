import Router from 'express';
import filtrationController from '../controllers/filtrationController.js';

const router = new Router();

router.post('/post/:url', filtrationController.parseParams);

export default router;
