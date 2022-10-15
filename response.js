exports.status = (values, res) => {
  const data = {
    status: 200,
    values,
  };

  data.json(data);
  data.end();
};
