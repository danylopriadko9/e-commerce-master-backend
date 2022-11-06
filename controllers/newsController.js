import dbService from '../config/connection.js';

class newsController {
  async getAllNews(req, res) {
    const db = dbService.getDbServiceInstance();
    const result = db.getAllNews();

    result.then((data) => res.json(data));
  }
}

export default new newsController();
