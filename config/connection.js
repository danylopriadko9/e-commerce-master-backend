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

  async getAllCategories() {
    try {
      const response = await new Promise((resolve, reject) => {
        let query = `
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

  async getSubcategoriesInformation(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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

  async getAllNews() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
          SELECT news_id, name, short_description, description, meta_title, t_created
          FROM news, news_lang
          WHERE news.id = news_lang.id AND language_id = 1
          ORDER BY sort DESC;
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

  async getCharacteristicsCategory(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getSubcategoriesFilterParams(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getFiltrationParams(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllProductsByCategory(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        let query = `
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

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsOnByCategory(url, startingLimit, qtyItemsPage) {
    try {
      const response = await new Promise((resolve, reject) => {
        let query = `
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
            LIMIT ${startingLimit}, ${qtyItemsPage}
        `;

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsWithDiscount() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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
            c.iso,
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
        AND pp.discount_percent > 25
        `;

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getNewProducts() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
            SELECT distinct
            pl.name as product_name, 
              cl.name as category_name, 
              pl.url, 
              pp.base_price, 
              pp.discount_percent, 
              pc.product_id,
              cl.category_id,
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

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getOneProductByUrl(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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
        WHERE pl.url = '${url}'
        AND cl.language_id = 1
      `;

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getAffPhotoForOneProduct(id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
        SELECT filename
        FROM product p
        JOIN product_image pi ON p.id = pi.product_id
        WHERE p.id = ${id}
      `;

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getCharacteristics(id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getPropertiesProducts(id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
        SELECT DISTINCT 
            relation_product_id AS product_id, 
            pl.name AS product_name, 
            pl.description, 
            pl.url, 
            cl.name AS category_name,
            pp.base_price,
            pp.discount_percent,
            c.iso,
            cl.url as category_url
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
        WHERE prp.product_id IN(${
          typeof id === 'string' ? id : Array.from(id).join(', ')
        })
        AND pl.language_id = 1
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

  async getCompareCharacteristicsValue(id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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

        db.query(query, (err, data) => {
          if (err) console.log(err);
          resolve({
            [id]: data,
          });
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getHistoryByProductUrl(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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
      WHERE pl.url = '${url}'
      `;

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getHistoryByProductUrlInParentGroup(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
            SELECT 
            pl.name AS product_name,
            pl.url AS product_url,
            cl.name AS category_name,
            cl.url AS category_url
          FROM master.product_lang pl
          JOIN product_category pc
            ON pc.product_id = pl.product_id
          JOIN category_lang cl
            ON cl.category_id = pc.category_id
          WHERE pl.url = '${url}'
          AND pl.language_id = 1
          AND cl.language_id = 1
        `;

        db.query(query, (err, data) => {
          if (err) console.lot(err);
          resolve(data);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getGroupHistory(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
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
      WHERE cl.url = '${url}'
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

//   async parentGroupOrNot(url){
//   try {
//     const response = await new Promise((resolve, reject) => {
//       const query = `
//           SELECT DISTINCT
//           c.id
//         FROM category c
//         JOIN category_lang cl
//           ON cl.category_id = c.id
//         AND cl.url = '${url}'
//         AND c.parent_id = 0
//       `;

//       db.query(query, (err, data) => {
//         if (err) console.lot(err);
//         let result = Array.form(data).length ? true : false
//         resolve(result);
//       });
//     })
//     return response
//   } catch (error) {
//     console.log(error)
//   }
// }

// async getProductsWithDiscountQuery(){
//   try {
//     const response = await new Promise((resolve, reject) => {
//       const query = `

//       `;

//       db.query(query, (err, data) => {
//         if (err) console.lot(err);
//         resolve(data);
//       });
//     })
//     return response
//   } catch (error) {
//     console.log(error)
//   }
// }

//upobthli_newmasterdb
//upobthli_newmasterdb
//80jcF0Sd~H_P

export default DbService;
