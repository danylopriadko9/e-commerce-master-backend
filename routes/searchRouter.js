import Router from 'express';
import productController from '../controllers/productController.js';

const searchRouter = new Router();

searchRouter.get(
  '/:groupUrl?/:searchValue/:page',
  productController.getSearchItems
);

export default searchRouter;
