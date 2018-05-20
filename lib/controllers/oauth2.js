'use strict';

const crypto = require('crypto');
const passport = require('passport');
const oauth2orize = require('oauth2orize');

require('../db');
const config = require('../config');
const models = require('../models');
const log = require('../log')(module);

const aserver = oauth2orize.createServer();

const errFn = (cb, err) => {
  if (err) {
    return cb(err);
  }
};

const generateTokens = (data, done) => {
  const errorHandler = errFn.bind(undefined, done);

  models.RefreshToken.remove(data, errorHandler);
  models.AccessToken.remove(data, errorHandler);

  const tokenValue = crypto.randomBytes(32).toString('hex');
  const refreshTokenValue = crypto.randomBytes(32).toString('hex');

  data.token = tokenValue;
  const token = new models.AccessToken(data);

  data.token = refreshTokenValue;
  const refreshToken = new models.RefreshToken(data);

  refreshToken.save(errorHandler);

  token.save((err) => {
    if (err) {
      log.error(err);
      return done(err);
    }

    done(null, tokenValue, refreshTokenValue, {
      'expires_in': config.get('security:tokenLife'),
    });
  });
};


aserver.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
  models.User.findOne({username: username}, (err, user) => {
    if (err) {
      return done(err);
    }

    if (!user || !user.checkPassword(password)) {
      return done(null, false);
    }

    const model = {
      userId: user.userId,
      clientId: client.clientId,
    };

    generateTokens(model, done);
  });
}));

aserver.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  models.RefreshToken.findOne({token: refreshToken, clientId: client.clientId}, (err, token) => {
    if (err) {
      return done(err);
    }

    if (!token) {
      return done(null, false);
    }

    models.User.findById(token.userId, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }

      const model = {
        userId: user.userId,
        clientId: client.clientId,
      };

      generateTokens(model, done);
    });
  });
}));

exports.token = [
  passport.authenticate('clientPassword', {session: false, failWithError: true}),
  aserver.token(),
  aserver.errorHandler(),
];
