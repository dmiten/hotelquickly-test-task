'use strict';

const winston = require('winston');

const getFormattedDate = () => {
  const dateNow = new Date(Date.now());

  return (`${dateNow.toLocaleString()}.${dateNow.getUTCMilliseconds()}`);
};

const getLogger = (module) => new winston.Logger({
  transports: [
    new winston.transports.Console({
      label: module.filename.split('/').slice(-2).join('/'),
      handleException: true,
      timestamp: getFormattedDate,
      colorize: true,
      level: 'debug',
      json: false,
    }),
  ],
  exitOnError: false,
});

module.exports = getLogger;
