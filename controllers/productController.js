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
      pc.product_id 
  FROM product_category pc
  JOIN product_lang pl ON pc.product_id = pl.product_id
  JOIN category_lang cl ON pc.category_id = cl.category_id
  JOIN product_price pp ON pc.product_id = pp.product_id
  JOIN product_image pi ON pi.product_id = pc.product_id
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
            pc.product_id
        FROM product_category pc
        JOIN product_lang pl ON pc.product_id = pl.product_id
        JOIN category_lang cl ON pc.category_id = cl.category_id
        JOIN product_price pp ON pc.product_id = pp.product_id
        JOIN product_image pi ON pi.product_id = pc.product_id
        JOIN product p ON pc.product_id = p.id
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
      pl.meta_title
    FROM product_category pc
    JOIN product_lang pl ON pc.product_id = pl.product_id
    JOIN category_lang cl ON pc.category_id = cl.category_id
    JOIN product_price pp ON pc.product_id = pp.product_id
    JOIN product p ON pc.product_id = p.id
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
        pp.discount_percent
    FROM product_rel_product prp
    JOIN product_lang pl 
	    ON pl.product_id = prp.relation_product_id
    JOIN product_category pc 
	    ON pc.product_id = prp.relation_product_id
    JOIN product_price pp 
	    ON pp.product_id = prp.relation_product_id
    JOIN category_lang cl 
	    ON cl.category_id = pc.category_id
    WHERE prp.product_id = ${id}
    AND pl.language_id = cl.language_id = 1
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);
    return res.json(data);
  });
};
