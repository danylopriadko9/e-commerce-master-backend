import axios from 'axios';
import { db } from '../connection.js';

const calcPriceForOneProducts = (item, currency) => {
  const actualProductCurrency = currency.find((el) => el.ccy === item.iso);
  return item.discount_percent
    ? (item.base_price - (item.base_price * item.discount_percent) / 100) *
        actualProductCurrency.sale
    : item.base_price * actualProductCurrency.sale;
};

export const countProductCurrency = async (
  url,
  min = 0,
  max = 0,
  manufacturer
) => {
  const { data } = await axios.get(
    'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11'
  );

  const res = data
    .map((el) => (el.ccy === 'RUR' ? { ...el, ccy: 'RUB' } : el))
    .filter((el) => el.ccy !== 'BTC');

  const result = [
    ...res,
    {
      ccy: 'UAH',
      base_ccy: 'UAH',
      buy: '1',
      sale: '1',
    },
  ];

  let q = `
    SELECT DISTINCT
        pc.product_id as id,
        pp.base_price,
        pp.discount_percent,
        c.iso
    FROM product_category pc
    JOIN category_lang cl
        ON cl.category_id = pc.category_id
    JOIN product_price pp
        ON pc.product_id = pp.product_id
    JOIN currency c
        ON c.id = pp.currency_id
    JOIN product p
        ON p.id = pc.product_id
    WHERE cl.url = '${url}'
  `;

  if (manufacturer.length)
    q = q + ` AND p.manufacturer_id IN (${manufacturer.join(', ')})`;

  db.query(q, (err, data) => {
    if (err) console.log(err);

    if (!min && !max) {
      const ress = data.map((el) => el.id);
      console.log('преждевременно', ress);
      return ress;
    } else {
      data.forEach((el) => {
        const price = calcPriceForOneProducts(el, result);
        el.price = Math.ceil(price);
      });

      const new_data = data.filter((el) => {
        if (min && max) return el.price > min && el.price < max;
        else if (min && !max) return el.price > min;
        else if (max && !min) return el.price < max;
      });
      new_data.map((el) => el.id);
      console.log('new_data', new_data);
      return new_data;
    }
  });
};
