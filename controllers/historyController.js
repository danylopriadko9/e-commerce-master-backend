import dbService from '../config/connection.js';

class historyController {
  async getHistoryMap(req, res) {
    try {
      const db = dbService.getDbServiceInstance();
      const url = req.params.url;

      if (url.includes('tovar')) {
        const clean_url = url.replace('tovar_', '');
        const result = db.getHistoryByProductUrl(clean_url);

        result.then((data) => {
          if (!data.length) {
            const result = db.getHistoryByProductUrlInParentGroup(clean_url);
            result.then((data) => res.json(...data));
            return;
          } else {
            res.json(...data);
            return;
          }
        });
      }

      if (url.includes('group')) {
        const clean_url = url.replace('group_', '');

        const result = db.getGroupHistory(clean_url);
        result.then((data) => res.json(...data));
        return;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new historyController();
