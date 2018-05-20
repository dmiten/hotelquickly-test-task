'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const User = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

User.methods.encryptPassword = function(password) {
  return crypto.pbkdf2Sync(password, this.salt, 100000, 64, 'sha512').toString('hex');
};

User.virtual('userId')
  .get(function() {
    return this.id;
  });

User.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = crypto.randomBytes(64).toString('hex');
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._plainPassword;
  });

User.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

module.exports = mongoose.model('User', User);
