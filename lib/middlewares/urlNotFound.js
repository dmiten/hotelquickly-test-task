'use strict';

const log = require('../helpers/log')(module);

module.exports = (req, res, next) => {
  log.debug('%s %d %s', req.method, res.statusCode, req.url);

  res.status(404);
  res.json({
    error: 'Not found',
  });
};
