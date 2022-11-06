import Router from 'express';
import categoryController from '../controllers/categoriesController.js';

const categoryRouter = new Router();

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get(
  '/subcategories/:url',
  categoryController.getSubcategoriesInformation
);
categoryRouter.get(
  '/productCategories/:url/:page',
  categoryController.getProductCategories
);
categoryRouter.get(
  '/subcategories/filter/:url',
  categoryController.getSubcategoriesFilterParams
);
categoryRouter.get(
  '/filter/category/:url',
  categoryController.getFiltrationCharacteristictAndParams
);
categoryRouter.get(
  '/compare/category/:url',
  categoryController.getCharacteristicsCategory
);

export default categoryRouter;
