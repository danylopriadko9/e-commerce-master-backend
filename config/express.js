import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

import router from '../routes/router.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/filter', router);

const __dirname = path.resolve();
app.use('/static', express.static(path.join(__dirname + '/static')));

dotenv.config();

export default app;
