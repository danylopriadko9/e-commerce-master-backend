import app from './config/express.js';

const port = process.env.PORT || 3001;

const startApp = () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on ${port} PORT!`);
    });
  } catch (error) {
    console.log(error);
  }
};

startApp();
