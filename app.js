import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

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

//--------------------categories
app.get('/categories', categoriesController.getAllCategories);
app.get(
  '/productCategories/:url/:page',
  categoriesController.getProductCategories
);
app.get(
  '/subcategories/:url',
  categoriesController.getSubcategoriesInformation
);

//--------------------news
app.get('/news', newsController.getAllNews);

//--------------------history block
app.get('/history/:url', historyController.getHistoryMap);
//-----------------------------------------------------------------------------

app.use('/static', express.static(path.join(__dirname + '/static')));

app.listen(port, () => {
  console.log(`Server is running on ${port} PORT!`);
});
