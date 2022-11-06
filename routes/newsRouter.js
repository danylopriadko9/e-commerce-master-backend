import Router from 'express';
import newsController from '../controllers/newsController.js';

const searchRouter = new Router();

searchRouter.get('/', newsController.getAllNews);

export default searchRouter;
