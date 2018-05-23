'use strict';

const express = require('express');

const models = require('../models');
const Errors = require('../helpers/errors');
const controllers = require('../controllers');

const router = express.Router(); // eslint-disable-line new-cap

module.exports = (app) => {
  router.param('bidId', (req, res, next, bidId) => {
    if (bidId.match(/^[0-9a-fA-F]{24}$/)) {
      return models.Bid
        .findById(bidId)
        .then((bid) => {
          if (!bid) {
            return next(new Errors.NotFound('Bid not found'));
          }

          req.requestedBid = bid;
          next();
        })
        .catch(next);
    } else {
      next(new Errors.BadId('Wrong bidId format'));
    }
  });

  router.get('/', controllers.bids.getList);
  router.post('/', controllers.bids.postNew);

  router.get('/:bidId', controllers.bids.getById);

  return router;
};
