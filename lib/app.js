'use strict';

const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');

require('./helpers/passport');
const routes = require('./routes');
const middlewares = require('./middlewares');

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());

app.use(routes(app));

app.use(middlewares.urlNotFound);
app.use(middlewares.errorHandler);

module.exports = app;
