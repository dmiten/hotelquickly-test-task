'use strict';

const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');

const config = require('../helpers/config');

const Schema = mongoose.Schema;
const auctionDuration = config.get('auction:duration'); // in seconds

const Room = new Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  stopAt: {
    type: Date,
    default: () => Date.now() + 1000 * auctionDuration,
  },
  minPrice: {
    type: Number,
    default: 1,
    min: 1,
  },
  description: {
    type: String,
    default: '',
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
