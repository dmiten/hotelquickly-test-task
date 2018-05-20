'use strict';

const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const Room = new Schema({
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
  startAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  stopAt: {
    type: Date,
    required: true,
    default: Date.now + 1000 * 60 * 10,
  },
  minPrice: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  currentPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 1,
  },
  currentBid: {
    type: String,
    required: true,
  },
}, {timestamps: true});

Room.methods.isNextPriceValid = function(newPrice) {
  const currentPrice = this.currentPrice || this.minPrice;

  return ((newPrice - currentPrice) > currentPrice * 0.05);
};

Room.pre('save', function(next) {
  if ((this.stopAt - Date.now) < 1000 * 60) {
    this.stopAt = this.stopAt + 1000 * 60;
  }
  next();
});

Room.plugin(paginate);

module.exports = mongoose.model('Room', Room);
