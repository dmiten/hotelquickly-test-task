'use strict';

const crypto = require('crypto');
const passport = require('passport');
const oauth2orize = require('oauth2orize');

require('../helpers/db');
const config = require('../helpers/config');
const models = require('../models');
const log = require('../helpers/log')(module);

const extendedLog = config.get('extendedLog');
const tokenLife = config.get('security:tokenLife');
const aserver = oauth2orize.createServer();

const errFn = (cb, err) => {
  if (err) {
    return cb(err);
  }
};

const generateTokens = (data, done) => {
  const errorHandler = errFn.bind(undefined, done);
  const accessTokenValue = crypto.randomBytes(32).toString('hex');
  const refreshTokenValue = crypto.randomBytes(32).toString('hex');

  return Promise.all([
    models.RefreshToken.remove(data, errorHandler),
    models.AccessToken.remove(data, errorHandler),
  ])
    .then(() => {
      data.token = accessTokenValue;
      const token = new models.AccessToken(data);

      data.token = refreshTokenValue;
      const refreshToken = new models.RefreshToken(data);

      return Promise.all([
        refreshToken.save(errorHandler),
        token.save(),
      ])
        .then(() => done(null, accessTokenValue, refreshTokenValue, {'expires_in': tokenLife}));
    })
    .catch(done);
};


aserver.exchange(oauth2orize.exchange.password((client, username, password, scope, done) =>
  models.User
    .findOne({username: username})
    .then((user) => {
      if (!user || !user.checkPassword(password)) {
        return done(null, false);
      }

      const model = {
        userId: user.userId,
        clientId: client.clientId,
      };

      extendedLog && log.info('Issued new token');

      return generateTokens(model, done);
    })
    .catch(done)
));

aserver.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) =>
  models.RefreshToken
    .findOne({token: refreshToken, clientId: client.clientId})
    .then((token) => {
      if (!token) {
        return done(null, false);
      }

      return models.User
        .findById(token.userId)
        .then((user) => {
          if (!user) {
            return done(null, false);
          }

          const model = {
            userId: user.userId,
            clientId: client.clientId,
          };

          extendedLog && log.info('Access token replaced with new one');

          return generateTokens(model, done);
        });
    })
    .catch(done)
));

exports.token = [
  passport.authenticate('clientPassword', {session: false, failWithError: true}),
  aserver.token(),
  aserver.errorHandler(),
];
