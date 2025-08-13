const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

//* All global middlewares *//
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors());

//* All API Routes *//
app.use('/api/v1', require('./routes/index.api'))

module.exports = { app };