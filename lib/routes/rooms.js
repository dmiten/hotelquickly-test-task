'use strict';

const express = require('express');

const models = require('../models');
const Errors = require('../helpers/errors');
const controllers = require('../controllers');

const router = express.Router(); // eslint-disable-line new-cap

module.exports = () => {
  router.param('roomId', (req, res, next, roomId) => {
    if (roomId.match(/^[0-9a-fA-F]{24}$/)) {
      return models.Room
        .findById(roomId)
        .then((room) => {
          if (!room) {
            return next(new Errors.NotFound('Room not found'));
          }

          req.requestedBid = room;
          next();
        })
        .catch(next);
    } else {
      next(new Errors.BadId('Wrong roomId format'));
    }
  });

  router.get('/', controllers.rooms.getList);
  router.post('/', controllers.rooms.postNew);

  router.get('/:roomId', controllers.rooms.getById);

  return router;
};
