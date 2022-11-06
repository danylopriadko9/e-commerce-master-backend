import Router from 'express';
import filtrationController from '../controllers/filtrationController.js';

const filterRouter = new Router();

filterRouter.post('/post/:url', filtrationController.parseParams);

export default filterRouter;
