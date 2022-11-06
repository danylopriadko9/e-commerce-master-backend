import dbService from '../config/connection.js';

class categoryController {
  async getAllCategories(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getAllCategories();

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getSubcategoriesInformation(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getSubcategoriesInformation(req.params.url);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getCharacteristicsCategory(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getCharacteristicsCategory(req.params.url);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getSubcategoriesFilterParams(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getSubcategoriesFilterParams(req.params.url);

      result.then((data) => res.json(data));
    } catch (error) {
      console.log(error);
    }
  }

  async getFiltrationCharacteristictAndParams(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const result = db.getCharacteristicsCategory(req.params.url);

      result.then((data) => {
        const paramsResult = db.getFiltrationParams(req.params.url);

        paramsResult.then((secoundData) => {
          const response_obj = {};

          secoundData.forEach((el) => {
            if (response_obj.hasOwnProperty(el.property_id)) {
              const prop_status = response_obj[el.property_id].includes(
                el.name
              );
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
    } catch (error) {
      console.log(error);
    }
  }

  async getProductCategories(req, res) {
    try {
      const page = req.params.page;
      const qtyItemsPage = 8;
      const startingLimit = (page - 1) * qtyItemsPage;

      const db = dbService.getDbServiceInstance();
      const result = db.getAllProductsByCategory(req.params.url);

      result.then((data) => {
        const numberOfResult = data.length;
        const numberOfPages = Math.ceil(data.length / qtyItemsPage);

        const limitResult = db.getProductsOnByCategory(
          req.params.url,
          startingLimit,
          qtyItemsPage
        );

        limitResult.then((data) =>
          res.json({
            data,
            numberOfResult,
            numberOfPages,
          })
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default new categoryController();
