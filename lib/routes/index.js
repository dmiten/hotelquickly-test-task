'use strict';

const express = require('express');

const controllers = require('../controllers');

const router = express.Router(); // eslint-disable-line new-cap

module.exports = () => {
  router.get('/', controllers.getApiStatus);

  return router;
};
