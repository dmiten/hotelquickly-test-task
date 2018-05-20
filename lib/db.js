'use strict';

const mongoose = require('mongoose');

const log = require('./log')(module);
const config = require('./config');

mongoose.connect(config.get('mongoose:uri') || process.env.URI);

const db = mongoose.connection;

db.on('error', (err) => log.error('Connection error: ', err.message));
db.once('open', () => log.info('Connected to DB'));
process.on('SIGINT', () => mongoose.connection.close(() => log.info('Connection close through app termination')));


module.exports = mongoose;
