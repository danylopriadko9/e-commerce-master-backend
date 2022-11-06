import categoryController from './controllers/categoriesController.js';
import productController from './controllers/productController.js';
import newsController from './controllers/newsController.js';
import historyController from './controllers/historyController.js';

import app from './config/express.js';

const port = process.env.PORT || 3001;

//-----------------------------------------------------------------------------
//--------------------products
app.get('/discount', productController.getProductsWithDiscount);
app.get('/getProductImage/:id', productController.getProductImage);
app.get('/newProducts', productController.getNewProducts);
app.get('/product/:url', productController.getOneProductByUrl);
app.get('/product/photos/:id', productController.getAffPhotoForOneProduct);
app.get('/product/characteristics/:id', productController.getCharacteristics);
app.get('/product/properties/:id', productController.getPropertiesProducts);

app.post(
  '/property_compare_products',
  productController.getPropertiesCompareProducts
);

//--------------------categories
app.get('/categories', categoryController.getAllCategories);
app.get('/subcategories/:url', categoryController.getSubcategoriesInformation);
app.get(
  '/productCategories/:url/:page',
  categoryController.getProductCategories
);
app.get(
  '/subcategories/filter/:url',
  categoryController.getSubcategoriesFilterParams
);
app.get(
  '/filter/category/:url',
  categoryController.getFiltrationCharacteristictAndParams
);
//--------------------news
app.get('/news', newsController.getAllNews);

//--------------------history block
app.get('/history/:url', historyController.getHistoryMap);
//--------------------compare
app.get('/compare/:id', productController.getCompareCharacteristicsValue);
app.get(
  '/compare/category/:url',
  categoryController.getCharacteristicsCategory
);
//-------------------search
app.get(
  '/search/:groupUrl?/:searchValue/:page',
  productController.getSearchItems
);

//-----------------------------------------------------------------------------

const startApp = () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on ${port} PORT!`);
    });
  } catch (error) {
    console.log(error);
  }
};

startApp();
