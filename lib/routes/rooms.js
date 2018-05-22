'use strict';

const express = require('express');

const models = require('../models');
const Errors = require('../helpers/errors');
const middlewares = require('../middlewares');
const controllers = require('../controllers');

const router = express.Router(); // eslint-disable-line new-cap

module.exports = () => {
  router.param('roomId', (req, res, next, roomId) => {
    if (roomId.match(/^[0-9a-fA-F]{24}$/)) {
      return models.Room
        .findById(roomId)
        .then((room) => {
          if (!room) {
            next(new Errors.NotFound('Room not found'));
            return;
          }

          req.requestedBid = room;
          next();
        })
        .catch(next);
    } else {
      next(new Errors.BadId('Wrong roomId format'));
    }
  });

  router.use('/:roomId', middlewares.withToken, controllers.rooms);

  return router;
};
