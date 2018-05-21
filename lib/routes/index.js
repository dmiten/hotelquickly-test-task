'use strict';

const express = require('express');

const controllers = require('../controllers');

const router = express.Router(); // eslint-disable-line new-cap

module.exports = (app) => {
  router.get('/', controllers.getApiStatus);
  router.use('/auth', controllers.oauth2.token);

  return router;
};
