import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

let instance = null;

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_LOGIN,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  async getFiltretionElementsByManufacturerAndCategory({ url, brands }) {
    try {
      const response = await new Promise((resolve, reject) => {
        let query = `
          SELECT DISTINCT
            p.id,
            prpv.property_id,
            pvl.property_value_id,
            pvl.name,
            p.manufacturer_id,
            pp.base_price,
            pp.discount_percent,
            c.iso
          FROM product p
          JOIN product_rel_property_value prpv
            ON prpv.product_id = p.id
          JOIN property_value_lang pvl
            ON pvl.property_value_id = prpv.property_value_id
	        JOIN product_category pc
			      ON p.id = pc.product_id
	        JOIN product_price pp
            ON pc.product_id = pp.product_id
          JOIN currency c
            ON c.id = pp.currency_id
          WHERE p.id IN (
		        SELECT distinct p.id FROM master.product p
		        JOIN product_category pc
			        ON p.id = pc.product_id
		        JOIN category_lang cl
			        ON cl.category_id = pc.category_id
		        WHERE cl.url = '${url}'
            AND cl.language_id = 1
          )
        `;

        if (brands.length)
          query += ` AND p.manufacturer_id IN(${brands.join(', ')})`;

        db.query(query, (err, data) => {
          if (err) console.log(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsByIds(data) {
    try {
      const response = await new Promise((resolve, reject) => {
        if (!data || !data.length) {
          resolve([]);
          return;
        }
        let query = `
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
        c.iso,
        cl.url as category_url
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
        WHERE pl.product_id IN(${data.map((el) => el.id)})
        AND cl.language_id = 1
        `;

        db.query(query, (err, data) => {
          if (err) console.log(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}

export default DbService;
