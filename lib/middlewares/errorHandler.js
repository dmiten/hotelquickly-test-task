'use strict';

const log = require('../helpers/log')(module);

module.exports = (err, req, res, next) => {
  log.error('%s %d %s', req.method, res.statusCode, err.message);

  res.status(err.status || 500);
  res.json({
    error: err.message,
  });
};
