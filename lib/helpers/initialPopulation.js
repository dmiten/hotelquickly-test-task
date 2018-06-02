'use strict';

const dbInit = require('./db');
const models = require('../models');
const log = require('./log')(module);
const initialPopulation = require('../../config/initialPopulation');

const populateUsers = () => {
  let usersPromises = [];

  initialPopulation.users.map((userConfig) => {
    const user = new models.User({
      username: userConfig.username,
      password: userConfig.password,
      role: userConfig.role,
    });

    usersPromises.push(
      user
        .save()
        .then(() => log.info('New user - ', user.username))
        .catch((err) => log.error(err.message))
    );
  });

  return usersPromises;
};

const populateClients = () => {
  let clientsPromises = [];

  initialPopulation.clients.map((clientConfig) => {
    const client = new models.Client({
      name: clientConfig.name,
      clientId: clientConfig.clientId,
      clientSecret: clientConfig.clientSecret,
    });

    clientsPromises.push(
      client
        .save()
        .then(() => log.info('New client - ', client.name))
        .catch((err) => log.error(err.message))
    );
  });

  return clientsPromises;
};

const db = dbInit();

db.connection.on('connected', () => {
  db.connection.dropDatabase((err) => {
    if (err) {
      log.error('Dropping DB error ', err.message);
    }
    log.info('DB dropped');

    Promise.all([
      ...populateUsers(),
      ...populateClients(),
    ])
      .then(() => process.exit())
      .catch((err) => log.error(err.message));
  });
});
