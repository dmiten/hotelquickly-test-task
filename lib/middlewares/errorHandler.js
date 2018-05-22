'use strict';

const log = require('../helpers/log')(module);

module.exports = (err, req, res, next) => {
  res.status(err.httpStatus || 500);
  res.json({
    error: err.message,
  });

  log.error(req.method, res.statusCode, err.message);
};
