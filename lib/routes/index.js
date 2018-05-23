'use strict';

const express = require('express');

const middlewares = require('../middlewares');
const controllers = require('../controllers');

const router = express.Router(); // eslint-disable-line new-cap

module.exports = (app) => {
  router.get('/', controllers.getApiStatus);
  router.use('/auth', controllers.oauth2.token);
  router.use('/bids', middlewares.withToken, require('./bids')(app));
  router.use('/rooms', middlewares.withToken, require('./rooms')(app));

  return router;
};
