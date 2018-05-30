'use strict';

const models = require('../models');
const config = require('../helpers/config');

const isTokenValid = (accessToken, cd) => {
  models.AccessToken.findOne({token: accessToken})
    .exec()
    .then((token) => {
      if (!token) {
        cd(null, {valid: false, message: 'Unauthenticated'});
      }

      if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife')) {
        cd(null, {valid: false, message: 'Token expired'});
      }

      cd(null, {valid: true, message: 'Authenticated'});
    })
    .catch(cd);
};

module.exports = isTokenValid;
