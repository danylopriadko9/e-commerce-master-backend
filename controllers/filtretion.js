class Filtration {
  parseInformation = (req, res) => {
    const url = req.params.url;
    const brands = req.body.brands;
    const min_price = req.body.min_price;
    const max_price = req.body.max_price;

    const params = req.body.filter_params;
    console.log(url);
  };
}

export default Filtration;
