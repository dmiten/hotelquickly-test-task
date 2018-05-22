'use strict';

const log = require('../helpers/log')(module);

module.exports = (req, res, next) => {
  res.status(404);
  res.json({
    error: 'Not found',
  });

  log.debug(req.method, res.statusCode, req.url);
};
