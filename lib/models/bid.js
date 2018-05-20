'use strict';

const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const Bid = new Schema({
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
  roomId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

Bid.plugin(paginate);

module.exports = mongoose.model('Bid', Bid);
