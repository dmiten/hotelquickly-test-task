'use strict';

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const config = require('./config');
const models = require('../models/index');

passport.use('basic', new BasicStrategy((username, password, done) =>
  models.Client
    .findOne({clientId: username})
    .then((client) => {
      if (!client) {
        return done(null, false);
      }

      if (client.clientSecret !== password) {
        return done(null, false);
      }

      return done(null, client);
    })
    .catch(done)
));

passport.use('clientPassword', new ClientPasswordStrategy((clientId, clientSecret, done) =>
  models.Client
    .findOne({clientId: clientId})
    .then((client) => {
      if (!client) {
        return done(null, false);
      }

      if (client.clientSecret !== clientSecret) {
        return done(null, false);
      }

      return done(null, client);
    })
    .catch(done)
));

passport.use('bearer', new BearerStrategy((accessToken, done) =>
  models.AccessToken
    .findOne({token: accessToken})
    .then((token) => {
      if (!token) {
        return done(null, false, {message: 'Unauthenticated'});
      }

      if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife')) {
        return done(null, false, {message: 'Token expired'});
      }

      return models.User
        .findById(token.userId)
        .then((user) => {
          if (!user) {
            return done(null, false, {message: 'Unknown user'});
          }

          return done(null, user, {scope: '*'});
        });
    })
    .catch(done)
));
