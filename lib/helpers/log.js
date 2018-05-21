'use strict';

const winston = require('winston');

const getLogger = (module) => new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      label: module.filename.split('/').slice(-2).join('/'),
      handleException: true,
      json: false,
      colorize: true,
    }),
  ],
  exitOnError: false,
});

module.exports = getLogger;
