import Router from 'express';
import productController from '../controllers/productController.js';

const productRouter = new Router();

productRouter.get('/discount', productController.getProductsWithDiscount);
productRouter.get('/getProductImage/:id', productController.getProductImage);
productRouter.get('/newProducts', productController.getNewProducts);
productRouter.get('/:url', productController.getOneProductByUrl);
productRouter.get('/photos/:id', productController.getAffPhotoForOneProduct);
productRouter.get('/characteristics/:id', productController.getCharacteristics);
productRouter.get('/properties/:id', productController.getPropertiesProducts);
productRouter.post(
  '/property_compare_products',
  productController.getPropertiesCompareProducts
);
productRouter.get(
  '/compare/:id',
  productController.getCompareCharacteristicsValue
);

export default productRouter;
