'use strict';

const packageJson = require('../../package.json');

module.exports = (req, res, next) => {
  res
    .status(200)
    .json({
      status: 'running',
      version: packageJson.version,
    });
};

