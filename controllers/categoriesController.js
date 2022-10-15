import { db } from '../connection.js';
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

export const getProductCategories = (req, res) => {
  const url = req.params.url;
  const page = req.params.page;
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
      pp.discount_percent
    FROM product_category pc
    JOIN category_lang cl 
      ON cl.category_id = pc.category_id
    JOIN product_lang pl 
      ON pl.product_id = pc.product_id
    JOIN product_price pp 
      ON pp.product_id = pc.product_id
    WHERE cl.language_id = pl.language_id = 1
    AND cl.url LIKE '${url}'
  `;

  db.query(q, (err, data) => {
    if (err) console.log(err);

    const qtyItemsPage = 8;
    const numberOfResult = data.length;
    const numberOfPages = Math.ceil(data.length / qtyItemsPage);

    const startingLimit = (page - 1) * qtyItemsPage;
    const secound_q = `
    SELECT DISTINCT
      pc.product_id, 
      pc.category_id, 
      pl.name AS product_name, 
      pl.url, 
      pl.meta_keywords,
      cl.name AS category_name,
      cl.url AS category_url,
      pp.base_price,
      pp.discount_percent
    FROM product_category pc
    JOIN category_lang cl 
      ON cl.category_id = pc.category_id
    JOIN product_lang pl 
      ON pl.product_id = pc.product_id
    JOIN product_price pp 
      ON pp.product_id = pc.product_id
    WHERE cl.language_id = pl.language_id = 1
    AND cl.url LIKE '${url}'
    LIMIT ${startingLimit}, ${qtyItemsPage}
  `;
    db.query(secound_q, (err, data) => {
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
