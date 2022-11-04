import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import bodyParser from 'body-parser';
import filtrationController from './controllers/filtrationController.js';
import router from './Router/router.js';

import {
  categoriesController,
  productController,
  newsController,
  historyController,
} from './controllers/index.js';
import path from 'path';

const port = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/filter', router);

const __dirname = path.resolve();

//-----------------------------------------------------------------------------
//--------------------products
app.get('/discount', productController.getProductsWithDiscountQuery);
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

//app.post('/filter/post:url', categoriesController.postFiltrationParams);

//--------------------categories
app.get('/categories', categoriesController.getAllCategories);
app.get(
  '/productCategories/:url/:page/:manufacturer?',
  categoriesController.getProductCategories
);
app.get(
  '/subcategories/:url',
  categoriesController.getSubcategoriesInformation
);
app.get(
  '/subcategories/filter/:url',
  categoriesController.getSubcategoriesFilterParams
);
app.get(
  '/filter/category/:url',
  categoriesController.getFiltrationCharacteristictAndParams
);

//--------------------news
app.get('/news', newsController.getAllNews);

//--------------------history block
app.get('/history/:url', historyController.getHistoryMap);
//--------------------compare
app.get('/compare/:id', productController.getCompareCharacteristicsValue);
app.get(
  '/compare/category/:url',
  categoriesController.getCharacteristicsCategory
);
//-------------------search
app.get(
  '/search/:groupUrl?/:searchValue/:page',
  productController.getSearchItems
);

//-----------------------------------------------------------------------------

app.use('/static', express.static(path.join(__dirname + '/static')));

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
