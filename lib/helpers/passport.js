'use strict';

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const config = require('./config');
const models = require('../models/index');

passport.use('basic', new BasicStrategy((username, password, done) => {
  models.Client.findOne({clientId: username}, (err, client) => {
    if (err) {
      return done(err);
    }

    if (!client) {
      return done(null, false);
    }

    if (client.clientSecret !== password) {
      return done(null, false);
    }

    return done(null, client);
  });
}));

passport.use('clientPassword', new ClientPasswordStrategy((clientId, clientSecret, done) => {
  models.Client.findOne({clientId: clientId}, (err, client) => {
    if (err) {
      return done(err);
    }

    if (!client) {
      return done(null, false);
    }

    if (client.clientSecret !== clientSecret) {
      return done(null, false);
    }

    return done(null, client);
  });
}));

passport.use('bearer', new BearerStrategy((accessToken, done) => {
  models.AccessToken.findOne({token: accessToken}, (err, token) => {
    if (err) {
      return done(err);
    }

    if (!token) {
      return done(null, false, {message: 'Unauthenticated'});
    }

    if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife')) {
      return done(null, false, {message: 'Token expired'});
    }

    models.User.findById(token.userId, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, {message: 'Unknown user'});
      }

      const info = {scope: '*'};
      done(null, user, info);
    });
  });
}));
