'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Client = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  clientId: {
    type: String,
    unique: true,
    required: true,
  },
  clientSecret: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Client', Client);
