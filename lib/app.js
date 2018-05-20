'use strict';

const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes');
const middlewares = require('./middlewares');

const app = express();

app.set(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(routes);

app.use(middlewares.urlNotFound);
app.use(middlewares.errorHandler);

module.exports = app;
