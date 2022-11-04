import dbService from '../config/connection.js';
import {
  formatData,
  filtrationByParams,
  filtrationdByPrice,
} from '../utils/createFilterData.js';

class filtretionController {
  async parseParams(req, res) {
    try {
      const filtretionParams = {
        url: req.params.url,
        brands: req.body.brands,
        min: req.body.min_price,
        max: req.body.max_price,
        params: req.body.filter_params,
      };

      const db = dbService.getDbServiceInstance();

      const result =
        db.getFiltretionElementsByManufacturerAndCategory(filtretionParams);

      result
        .then(async (data) => {
          const filtredByManufacturerAndCategoryData = formatData(data);

          const filtratredByParams = filtrationByParams(
            filtredByManufacturerAndCategoryData,
            req.body.filter_params
          );
          const filtratedProducts = filtrationdByPrice(
            filtratredByParams,
            req.body.min_price,
            req.body.max_price,
            req.body.currency
          );

          db.getProductsByIds(filtratedProducts).then((data) => res.json(data));
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  }
}

export default new filtretionController();
