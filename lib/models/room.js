'use strict';

const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const Room = new Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  startAt: {
    type: Date,
    default: Date.now,
  },
  stopAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 10,
  },
  minPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  currentPrice: {
    type: Number,
    default: 0,
    min: 0,
    set: function(currentPrice) {
      this.previousPrice = this.currentPrice;
      return currentPrice;
    },
  },
  currentBid: {
    type: Schema.Types.ObjectId,
    default: null,
  },
  bids: [{
    type: Schema.Types.ObjectId,
    ref: 'Bid',
  }],
}, {timestamps: true});

Room.pre('save', function(next) {
  this.isNew && next();

  if (this.currentPrice - this.previousPrice < this.previousPrice * 0.05) {
    return next(this.invalidate('currentPrice', 'Must be greater than previous by 5% at least'));
  }

  if (this.stopAt - Date.now() < 1000 * 60) {
    this.stopAt = this.stopAt + 1000 * 60;
  }

  next();
});

Room.plugin(paginate);

module.exports = mongoose.model('Room', Room);
