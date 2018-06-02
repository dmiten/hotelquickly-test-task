'use strict';

const crypto = require('crypto');
const passport = require('passport');
const oauth2orize = require('oauth2orize');

const config = require('../helpers/config');
const models = require('../models');
const log = require('../helpers/log')(module);

const extendedLog = config.get('extendedLog');
const tokenLife = config.get('security:tokenLife');
const authServer = oauth2orize.createServer();

const generateTokens = (data, done) => {
  const accessTokenValue = crypto.randomBytes(32).toString('hex');
  const refreshTokenValue = crypto.randomBytes(32).toString('hex');

  data.token = accessTokenValue;
  const accessToken = new models.AccessToken(data);

  data.token = refreshTokenValue;
  const refreshToken = new models.RefreshToken(data);

  const {userId, clientId} = data;

  return Promise.all([
    models.AccessToken.findOneAndDelete({userId, clientId}),
    models.RefreshToken.findOneAndDelete({userId, clientId}),
  ])
    .then(() =>
      Promise.all([
        accessToken.save(),
        refreshToken.save(),
      ])
        .then(() => done(null, accessTokenValue, refreshTokenValue, {'expires_in': tokenLife}))
    )
    .catch(done);
};


authServer.exchange(oauth2orize.exchange.password((client, username, password, scope, done) =>
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

authServer.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) =>
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
  authServer.token(),
  authServer.errorHandler(),
];
