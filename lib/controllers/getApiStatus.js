'use strict';

const packageJson = require('../../package.json');

module.exports = (req, res, next) => {
  res
    .status(200)
    .json({
      version: packageJson.version,
    });
};

