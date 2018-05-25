'use strict';

const express = require('express');

const models = require('../models');
const Errors = require('../helpers/errors');
const controllers = require('../controllers');
const isIdValid = require('../utils/isIdValid');

const router = express.Router(); // eslint-disable-line new-cap

module.exports = () => {
  router.param('roomId', (req, res, next, roomId) => {
    if (isIdValid(roomId)) {
      return models.Room
        .findById(roomId)
        .then((room) => {
          if (!room) {
            return next(new Errors.NotFound('Room not found'));
          }

          req.requestedRoom = room;
          next();
        })
        .catch(next);
    } else {
      next(new Errors.Unprocessable('Wrong roomId format'));
    }
  });

  router.get('/', controllers.rooms.getList);
  router.post('/', controllers.rooms.postNew);
  router.get('/:roomId', controllers.rooms.getById);
  // router.delete('/:roomId', controllers.rooms.deleteById); // It's better to keep all rooms and associated bids

  return router;
};
