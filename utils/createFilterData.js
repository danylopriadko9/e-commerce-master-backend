//import axios from 'axios';

export const formatData = (data) => {
  const unique_ids = Array.from(new Set(data.map((el) => el.id)));

  const items = unique_ids.map((el) => {
    const result = {};
    data
      .filter((e) => e.id === el)
      .forEach((item) => {
        if (!result.base_price) {
          result.base_price = item.base_price;
          result.iso = item.iso;
          result.discount_percent = result.discount_percent;
        }
        result[item.property_id] = item.name;
      });
    result.id = el;

    return result;
  });
  return items;
};

export const filtrationByParams = (items, params) => {
  if (!Object.keys(params).length) return items;
  const result = items.filter((el) => {
    let flag = 0;
    for (let key in params) {
      if (el[key] === params[key]) flag++;
      if (flag === Object.keys(params).length) return true;
    }
  });

  return result ? result : [];
};

// ----------------Count price and filtration by price

const calcPriceForOneProducts = (item, currency) => {
  const actualProductCurrency = currency.find((el) => el.ccy === item.iso);
  return item.discount_percent
    ? (item.base_price - (item.base_price * item.discount_percent) / 100) *
        actualProductCurrency.sale
    : item.base_price * actualProductCurrency.sale;
};

// const fetchAndModificateCurrency = async () => {
//   const { data } = await axios.get(
//     'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11'
//   );

//   const res = data
//     .map((el) => (el.ccy === 'RUR' ? { ...el, ccy: 'RUB' } : el))
//     .filter((el) => el.ccy !== 'BTC');

//   const result = [
//     ...res,
//     {
//       ccy: 'UAH',
//       base_ccy: 'UAH',
//       buy: '1',
//       sale: '1',
//     },
//   ];

//   return result;
// };

export const filtrationdByPrice = (data, min, max, currency) => {
  if ((!min && !max) || !data.length) return data;

  data.forEach((el) => {
    const price = calcPriceForOneProducts(el, currency);
    el.price = Math.ceil(price);
  });

  if (min) {
    data = data.filter((el) => el.price > min);
  }

  if (max) {
    data = data.filter((el) => el.price < max);
  }

  return data.length ? data : [];
};
