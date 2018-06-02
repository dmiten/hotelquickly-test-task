'use strict';

const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes');
const middlewares = require('./middlewares');
const makePassport = require('./helpers/passport');

const app = express();
const passport = makePassport();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());

app.use(routes(app));

app.use(middlewares.urlNotFound);
app.use(middlewares.errorsHandler);

module.exports = app;
