import { db } from '../connection.js';

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
