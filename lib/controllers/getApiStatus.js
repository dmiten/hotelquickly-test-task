'use strict';

const packageJson = require('../../package.json');

module.exports = (req, res, next) => {
  res.json({
    version: packageJson.version,
  });
};

