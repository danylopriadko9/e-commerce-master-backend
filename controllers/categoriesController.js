import { db } from '../connection.js';
import { countProductCurrency } from '../utils/countProductCurrency.js';
import axios from 'axios';

const calcPriceForOneProducts = (item, currency) => {
  const actualProductCurrency = currency.find((el) => el.ccy === item.iso);
  return item.discount_percent
    ? (item.base_price - (item.base_price * item.discount_percent) / 100) *
        actualProductCurrency.sale
    : item.base_price * actualProductCurrency.sale;
};

export const getAllCategories = (req, res) => {
  const categories = `
    SELECT 
    category.id, 
    category_lang.name, 
    category_lang.url, 
    category_lang.description, 
    category_lang.meta_title, 
    category_lang.meta_keywords, 
    category_lang.meta_description,
    category.parent_id
  FROM master.category, master.category_lang
  WHERE category.id = category_lang.category_id
  AND url IS NOT NULL
  AND status = 1 
  AND category_lang.language_id = 1
    `;

  db.query(categories, (err, data) => {
    if (err) throw err;
    return res.json(data);
  });
};

// pagination
export const getProductCategories = (req, res) => {
  const url = req.params.url;
  const page = req.params.page;
  const manufacturer = req.params.manufacturer;

  const qtyItemsPage = 8;

  const startingLimit = (page - 1) * qtyItemsPage;
  const q = `
  SELECT DISTINCT
	pc.product_id, 
      pc.category_id, 
      pl.name AS product_name, 
      pl.url, 
       pl.meta_keywords,
      cl.name AS category_name,
      cl.url AS category_url,
      pp.base_price,
      pp.discount_percent,
      c.iso,
      ml.name,
      ml.manufacturer_id
    FROM product_category pc
    JOIN category_lang cl 
      ON cl.category_id = pc.category_id
    JOIN product_lang pl 
      ON pl.product_id = pc.product_id
    JOIN product_price pp 
      ON pp.product_id = pc.product_id
    JOIN currency c
      ON c.id = pp.currency_id
	JOIN product p 
		ON p.id = pl.product_id
	JOIN manufacturer_lang ml
		ON ml.manufacturer_id = p.manufacturer_id
    WHERE cl.language_id = pl.language_id = 1
    AND cl.url LIKE '${url}'
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);

    const numberOfResult = data.length;
    const numberOfPages = Math.ceil(data.length / qtyItemsPage);

    db.query(q + ` LIMIT ${startingLimit}, ${qtyItemsPage}`, (err, data) => {
      if (err) console.log(err);
      return res.json({
        data,
        numberOfResult,
        numberOfPages,
      });
    });
  });
};

export const getSubcategoriesInformation = (req, res) => {
  const url = req.params.url;
  const q = ` 
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
AND c.parent_id IN (
	SELECT c.id
	FROM category c
	JOIN category_lang cl
		ON cl.category_id = c.id
	WHERE cl.language_id = 1 
	AND cl.url IS NOT NULL
    AND cl.url = '${url}'
)
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);
    res.json(data);
  });
};

export const getCharacteristicsCategory = (req, res) => {
  const url = req.params.url;
  const q = `
    SELECT DISTINCT 
      pl.name AS characteristic,
      pl.property_id
    FROM product_rel_property_value prpv
    JOIN property_value_lang pvl 
      ON pvl.property_value_id = prpv.property_value_id
    JOIN property_lang pl 
      ON pl.property_id = prpv.property_id
    JOIN product_category pc
      ON pc.product_id = prpv.product_id
    JOIN category_lang cl 
      ON cl.category_id = pc.category_id
    WHERE pl.language_id = pvl.language_id = 1
      AND prpv.status LIKE 'enabled'
      AND cl.url LIKE '${url}'
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);

    return res.json(data);
  });
};

export const getSubcategoriesFilterParams = (req, res) => {
  const url = req.params.url;
  const q = `
  SELECT
  ml.name,
    ml.manufacturer_id,
    COUNT(*) as qty
  FROM product_category pc
  JOIN category_lang cl 
    ON cl.category_id = pc.category_id
  JOIN product_lang pl 
    ON pl.product_id = pc.product_id
  JOIN product_price pp 
    ON pp.product_id = pc.product_id
  JOIN currency c
    ON c.id = pp.currency_id
JOIN product p 
  ON p.id = pl.product_id
JOIN manufacturer_lang ml
  ON ml.manufacturer_id = p.manufacturer_id
  WHERE cl.language_id = 1
  AND pl.language_id = 1
  AND ml.language_id = 1
  AND cl.url LIKE '${url}'
 GROUP BY ml.name
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);

    return res.json(data);
  });
};

export const getFiltrationCharacteristictAndParams = (req, res) => {
  const url = req.params.url;
  const q = `
    SELECT DISTINCT 
      pl.name AS characteristic,
      pl.property_id
    FROM product_rel_property_value prpv
    JOIN property_value_lang pvl 
      ON pvl.property_value_id = prpv.property_value_id
    JOIN property_lang pl 
      ON pl.property_id = prpv.property_id
    JOIN product_category pc
      ON pc.product_id = prpv.product_id
    JOIN category_lang cl 
      ON cl.category_id = pc.category_id
    WHERE pl.language_id = pvl.language_id = 1
      AND prpv.status LIKE 'enabled'
      AND cl.url LIKE '${url}'
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);

    const secound_q = `
      SELECT DISTINCT
        pl.name, 
        pvl.name,
        prpv.property_value_id,
        pc.product_id,
        prpv.property_id
      FROM master.product_rel_property_value prpv
      JOIN property_lang pl 
        ON pl.property_id = prpv.property_id
      JOIN product_category pc
        ON pc.product_id = prpv.product_id
      JOIN category_lang cl
        ON cl.category_id = pc.category_id
      JOIN property_value_lang pvl
        ON pvl.property_value_id = prpv.property_value_id
      WHERE cl.url = '${url}'
      AND pl.language_id = 1
      AND cl.language_id = 1
      AND pvl.language_id = 1
    `;

    db.query(secound_q, (err, secound_data) => {
      if (err) console.log(err);

      const response_obj = {};

      secound_data.forEach((el) => {
        if (response_obj.hasOwnProperty(el.property_id)) {
          const prop_status = response_obj[el.property_id].includes(el.name);
          if (!prop_status && el.name.length)
            response_obj[el.property_id].push(el.name);
        } else {
          if (el.name.length > 0) {
            response_obj[el.property_id] = [el.name];
          }
        }
      });

      return res.json({
        characteriscics: data,
        values: response_obj,
      });
    });
  });
};

export const postFiltrationParams = async (req, res) => {
  const filtretionParams = {
    url: req.params.url,
    brands: req.body.brands,
    min: req.body.min_price,
    max: req.body.max_price,
    params: req.body.filter_params,
  };
};
