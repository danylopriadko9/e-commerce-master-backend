import dbService from '../config/connection.js';
import dotenv from 'dotenv';
dotenv.config();

import { readdir } from 'fs/promises';
import path from 'path';

class productController {
  async getProductsWithDiscount(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getProductsWithDiscount();

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getProductImage(req, res) {
    try {
      const dir = `/static/product/${req.params.id}`;
      const dirents = await readdir(path.resolve() + dir, (err) => {
        if (err) throw new Error(err);
      });
      res.redirect(`http://localhost:3001${dir}/${dirents[0]}`);
    } catch (error) {
      console.log(error);
    }
  }

  async getNewProducts(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getNewProducts();

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getOneProductByUrl(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getOneProductByUrl(req.params.url);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getAffPhotoForOneProduct(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getAffPhotoForOneProduct(req.params.id);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getCharacteristics(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getCharacteristics(req.params.id);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getPropertiesProducts(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getPropertiesProducts(req.params.id);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getCompareCharacteristicsValue(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getCompareCharacteristicsValue(req.params.id);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getPropertiesCompareProducts(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getPropertiesProducts(req.body.data);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getSearchItems(req, res) {
    try {
      const group_url = req.params.groupUrl;
      const search_value = req.params.searchValue;
      const page = req.params.page;

      const qtyItemsPage = 8;
      const startingLimit = (page - 1) * qtyItemsPage;

      if (group_url) {
        const clean_group_url = group_url.replace('group_', '');
        //запрос на группу, родительская ли она
        const category_q = `
      SELECT DISTINCT
        c.id
      FROM category c
      JOIN category_lang cl
        ON cl.category_id = c.id
      AND cl.url = '${clean_group_url}'
      AND c.parent_id = 0
    `;
        db.query(category_q, (err, data) => {
          if (err) console.log(err);
          // если не родительская
          if (!data.length) {
            const q = `
          SELECT DISTINCT
            pl.name as product_name, 
            cl.name as category_name, 
            pl.url, 
            pp.base_price, 
            pp.discount_percent, 
            pc.product_id,
            pc.category_id,
            c.id,
            c.iso,
            pl.product_id,
            cl.url as category_url
          FROM product_category pc
          JOIN product_lang pl 
            ON pc.product_id = pl.product_id
          JOIN category_lang cl 
            ON pc.category_id = cl.category_id
          JOIN product_price pp 
            ON pc.product_id = pp.product_id
          JOIN product_image pi 
            ON pi.product_id = pc.product_id
          JOIN currency c
            ON c.id = pp.currency_id
          WHERE pl.language_id = 1 
          AND cl.language_id = 1
          AND cl.url LIKE '${clean_group_url}'
          AND pl.name LIKE '%${search_value}%'
          OR pc.product_id = '${search_value}'
          AND cl.url LIKE '${clean_group_url}'
          OR cl.name LIKE '%${search_value}%'
          AND cl.url LIKE '${clean_group_url}'
        `;

            db.query(q, (err, data) => {
              if (err) console.log(err);
              const numberOfPages = Math.ceil(data.length / qtyItemsPage);
              db.query(
                q + ` LIMIT ${startingLimit}, ${qtyItemsPage}`,
                (error, products) => {
                  if (error) console.log(error);

                  return res.json({
                    data: products,
                    type: 'product',
                    pageQty: numberOfPages,
                  });
                }
              );
            });
            return;
          } else {
            // если родительская
            const subcategories_q = `
          SELECT 
            c.id,
            ci.dir_path,
            ci.filename,
            cl.name,
            cl.url
          FROM category c
          JOIN category_lang cl 
          ON c.id = cl.category_id
          JOIN category_image ci
          ON ci.category_id = c.id
          WHERE cl.language_id = 1
          AND cl.name LIKE '%${search_value}%'
          AND c.parent_id IN (
            SELECT c.id
            FROM category c
            JOIN category_lang cl
              ON cl.category_id = c.id
            WHERE cl.language_id = 1 
            AND cl.url IS NOT NULL
            AND cl.url = '${clean_group_url}'
          )
        `;
            db.query(subcategories_q, (err, data) => {
              if (err) console.log(err);
              return res.json({
                data: data,
                type: 'category',
              });
            });
            return;
          }
        });
      }
      // если ищем с главной страницы
      if (search_value && !group_url) {
        const q = `
      SELECT DISTINCT
        pl.name as product_name, 
        cl.name as category_name, 
        pl.url, 
        pp.base_price, 
        pp.discount_percent, 
        pc.product_id,
        pc.category_id,
        c.id,
        c.iso,
        pl.product_id,
        cl.url as category_url
    FROM product_category pc
    JOIN product_lang pl 
      ON pc.product_id = pl.product_id
    JOIN category_lang cl 
      ON pc.category_id = cl.category_id
    JOIN product_price pp 
      ON pc.product_id = pp.product_id
    JOIN product_image pi 
      ON pi.product_id = pc.product_id
    JOIN currency c
      ON c.id = pp.currency_id
    WHERE pl.language_id = 1 
      AND cl.language_id = 1
      AND pl.name LIKE '%${search_value}%'
        OR cl.name LIKE '%${search_value}%'
        OR pc.product_id = '${search_value}'
    `;

        db.query(q, (err, data) => {
          if (err) console.log(err);
          const numberOfPages = Math.ceil(data.length / qtyItemsPage);

          db.query(
            q + ` LIMIT ${startingLimit}, ${qtyItemsPage}`,
            (error, products) => {
              if (error) console.log(error);
              return res.json({
                data: products,
                type: 'product',
                pageQty: numberOfPages,
              });
            }
          );
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new productController();
