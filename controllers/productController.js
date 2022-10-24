import { db } from '../connection.js';

import { readdir } from 'fs/promises';
import path from 'path';
const __dirname = path.resolve();

export const getProductsWithDiscountQuery = (req, res) => {
  const productsWithDiscountQuery = `
    SELECT 
      pl.name as product_name, 
      cl.name as category_name, 
      pl.url, 
      pp.base_price, 
      pp.discount_percent, 
      pi.dir_path, 
      pi.filename, 
      pc.product_id,
      pc.category_id,
      c.id,
      c.iso
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
  AND pp.discount_percent > 25
    `;

  db.query(productsWithDiscountQuery, (err, data) => {
    if (err) console.log(err);
    return res.json(data);
  });
};

export const getProductImage = async (req, res) => {
  const dir = `/static/product/${req.params.id}`;
  const dirents = await readdir(__dirname + dir, (err) => {
    if (err) throw new Error(err);
  });
  res.redirect(`http://localhost:3001${dir}/${dirents[0]}`);
};

export const getNewProducts = (req, res) => {
  const q = `
        SELECT distinct
	        pl.name as product_name, 
            cl.name as category_name, 
            pl.url, 
            pp.base_price, 
            pp.discount_percent, 
            pc.product_id,
            cl.category_id,
            c.id,
            c.iso
        FROM product_category pc
        JOIN product_lang pl 
          ON pc.product_id = pl.product_id
        JOIN category_lang cl 
          ON pc.category_id = cl.category_id
        JOIN product_price pp 
          ON pc.product_id = pp.product_id
        JOIN product_image pi 
          ON pi.product_id = pc.product_id
        JOIN product p 
          ON pc.product_id = p.id
        JOIN currency c
	        ON c.id = pp.currency_id
        WHERE pl.language_id = 1 
        AND cl.language_id = 1
        ORDER BY p.t_created DESC
        LIMIT 20
    `;

  db.query(q, (err, data) => {
    if (err) console.log(err);
    return res.json(data);
  });
};

export const getOneProductByUrl = (req, res) => {
  const url = req.params.url;
  const q = `
    SELECT distinct
      pl.name as product_name, 
      cl.name as category_name, 
      pl.url, 
      pp.base_price, 
      pp.discount_percent, 
      pc.product_id,
      pl.description,
      pl.meta_description,
      pl.meta_title,
      pc.category_id,
      c.id,
      c.iso
    FROM product_category pc
    JOIN product_lang pl 
      ON pc.product_id = pl.product_id
    JOIN category_lang cl 
      ON pc.category_id = cl.category_id
    JOIN product_price pp 
      ON pc.product_id = pp.product_id
    JOIN product p 
      ON pc.product_id = p.id
    JOIN currency c
	    ON c.id = pp.currency_id
    WHERE pl.url = '${url}'
    AND cl.language_id = 1
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);
    return res.json(data);
  });
};

export const getAffPhotoForOneProduct = (req, res) => {
  const id = req.params.id;

  const q = `
    SELECT filename
    FROM product p
    JOIN product_image pi ON p.id = pi.product_id
    WHERE p.id = ${id}
  `;
  if (id) {
    db.query(q, (err, data) => {
      if (err) console.log(err);
      return res.json(data);
    });
  }
};

export const getCharacteristics = (req, res) => {
  const id = req.params.id;
  const q = `
    SELECT DISTINCT 
	    prpv.product_id, 
      pl.name AS characteristic, 
      pvl.name AS value
    FROM product_rel_property_value prpv
    JOIN property_value_lang pvl ON pvl.property_value_id = prpv.property_value_id
    JOIN property_lang pl ON pl.property_id = prpv.property_id
    WHERE pl.language_id = pvl.language_id = 1
    AND prpv.status LIKE 'enabled'
    AND prpv.product_id = ${id}
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);
    return res.json(data);
  });
};

export const getPropertiesProducts = (req, res) => {
  const id = req.params.id;
  const q = `
  SELECT DISTINCT 
		relation_product_id AS product_id, 
        pl.name AS product_name, 
        pl.description, 
        pl.url, 
        cl.name AS category_name,
        pp.base_price,
        pp.discount_percent,
        c.iso
    FROM product_rel_product prp
    JOIN product_lang pl 
	    ON pl.product_id = prp.relation_product_id
    JOIN product_category pc 
	    ON pc.product_id = prp.relation_product_id
    JOIN product_price pp 
	    ON pp.product_id = prp.relation_product_id
    JOIN category_lang cl 
	    ON cl.category_id = pc.category_id
    JOIN currency c
	    ON c.id = pp.currency_id
    WHERE prp.product_id IN(${id})
    AND pl.language_id = 1
    AND cl.language_id = 1
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);
    return res.json(data);
  });
};

export const getCompareCharacteristicsValue = (req, res) => {
  const id = req.params.id;
  const q = `
    SELECT DISTINCT 
      pvl.name AS value,
      pl.property_id,
      p.guarantee
    FROM product_rel_property_value prpv
    JOIN property_value_lang pvl 
      ON pvl.property_value_id = prpv.property_value_id
    JOIN property_lang pl 
      ON pl.property_id = prpv.property_id
    JOIN product p
      ON p.id = prpv.product_id
    WHERE pl.language_id = pvl.language_id = 1
      AND prpv.status LIKE 'enabled'
      AND prpv.product_id = ${id}
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);
    return res.json({
      [id]: data,
    });
  });
};

export const getPropertiesCompareProducts = (req, res) => {
  const id_arr = req.body.data;
  console.log(id_arr);
  const q = `
    SELECT DISTINCT
      relation_product_id AS product_id,
      pl.name AS product_name,
      pl.description,
      pl.url,
      cl.name AS category_name,
      pp.base_price,
      pp.discount_percent,
      c.iso
    FROM product_rel_product prp
    JOIN product_lang pl
      ON pl.product_id = prp.relation_product_id
    JOIN product_category pc
      ON pc.product_id = prp.relation_product_id
    JOIN product_price pp
      ON pp.product_id = prp.relation_product_id
    JOIN category_lang cl
      ON cl.category_id = pc.category_id
    JOIN currency c
	    ON c.id = pp.currency_id
    WHERE prp.product_id IN(${id_arr.join(',')})
    AND pl.language_id = cl.language_id = 1
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);
    return res.json(data);
  });
};

export const getSearchItems = (req, res) => {
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
        pl.product_id
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
};
