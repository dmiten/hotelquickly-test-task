'use strict';

const config = require('../config');


module.exports = (req, res, next) => {
  res.json({
    status: 'OK',
    version: config.get('api:version'),
  });
};

