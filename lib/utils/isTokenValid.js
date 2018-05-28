'use strict';

const models = require('../models');
const config = require('../helpers/config');
const log = require('../helpers/log')(module);

const isTokenValid = (accessToken) => {
  return models.AccessToken.findOne({token: accessToken})
    .exec()
    .then((token) => {
      if (!token) {
        return ({isValid: false, message: 'Unauthenticated'});
      }

      if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife')) {
        return ({valid: false, message: 'Token expired'});
      }

      return ({valid: true, message: 'Authenticated'});
    })
    .catch((err) => log.error(err));
};

module.exports = isTokenValid;
