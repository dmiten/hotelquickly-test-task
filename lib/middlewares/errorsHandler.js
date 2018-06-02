'use strict';

const log = require('../helpers/log')(module);

module.exports = (err, req, res, next) => {
  res
    .status(err.httpStatus || 500)
    .json({
      error: err.message,
    });

  log.error(req.method, err.httpStatus || 500, err.message);
};
