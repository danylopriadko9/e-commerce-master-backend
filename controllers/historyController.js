import { db } from '../connection.js';

export const getHistoryMap = (req, res) => {
  const url = req.params.url;
  if (url.includes('tovar')) {
    const clean_url = url.replace('tovar_', '');

    const q = `
            SELECT DISTINCT
                pl.name AS product_name,
                pl.url AS product_url,
                cl.name AS category_name,
                cl.url AS category_url,
                c.parent_id,
                sc.name AS parent_name,
                sc.url AS parent_url
            FROM product_category pc
            JOIN category c
                ON c.id = pc.category_id
            JOIN product_lang pl
                ON pl.product_id = pc.product_id
            JOIN category_lang cl
                ON cl.category_id = c.id
            JOIN category_lang sc
                ON c.parent_id = sc.category_id
            WHERE pl.url = '${clean_url}'
        `;

    db.query(q, (err, data) => {
      if (err) console.log(err);
      return res.json(...data);
    });
  }

  if (url.includes('group')) {
    const clean_url = url.replace('group_', '');

    const q = `
            SELECT DISTINCT
                cl.name AS category_name,
                cl.url AS category_url,
                c.parent_id,
                sc.name AS parent_name,
                sc.url AS parent_url
            FROM category c
            LEFT JOIN category_lang cl
            ON cl.category_id = c.id
            LEFT JOIN category_lang sc
                ON c.parent_id = sc.category_id
            WHERE cl.url = '${clean_url}'
        `;

    db.query(q, (err, data) => {
      if (err) console.log(err);
      return res.json(...data);
    });
  }
};
