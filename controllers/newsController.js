import { db } from '../config/connection.js';
import dbService from '../config/connection.js';

class newsController {
  async getAllNews(req, res) {
    const db = dbService.getDbServiceInstance();
    const result = db.getAllNews();

    result.then((data) => res.json(data));
  }
}

export const getAllNews = (req, res) => {
  const newsQuery = `
        SELECT news_id, name, short_description, description, meta_title, t_created
        FROM news, news_lang
        WHERE news.id = news_lang.id AND language_id = 1
        ORDER BY sort DESC;
      `;

  db.query(newsQuery, (err, data) => {
    if (err) console.log(err);
    return res.json(data);
  });
};

export default new newsController();
