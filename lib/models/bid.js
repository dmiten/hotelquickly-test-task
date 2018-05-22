'use strict';

const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const Bid = new Schema({
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
  created: {
    type: Date,
    default: Date.now,
  },
});

Bid.plugin(paginate);

module.exports = mongoose.model('Bid', Bid);
