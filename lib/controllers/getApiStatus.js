'use strict';

const config = require('../helpers/config');

module.exports = (req, res, next) => {
  res.json({
    status: 'OK',
    version: config.get('api:version'),
  });
};

