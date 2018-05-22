'use strict';

const express = require('express');

const controllers = require('../controllers');

const router = express.Router(); // eslint-disable-line new-cap

module.exports = (app) => {
  router.get('/', controllers.getApiStatus);
  router.use('/auth', controllers.oauth2.token);
  router.use('/bids', require('./bids')(app));
  router.use('/rooms', require('./rooms')(app));

  return router;
};
