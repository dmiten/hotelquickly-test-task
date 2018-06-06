'use strict';

const models = require('../models');
const Errors = require('../helpers/errors');
const config = require('../helpers/config');
const log = require('../helpers/log')(module);
const socketServer = require('../helpers/socketServer');
const getUrlForNewResource = require('../utils/getUrlForNewResource');

const extendedLog = config.get('extendedLog');
const roomCreators = config.get('db:roomCreators');
const itemsPerQuery = config.get('db:itemsPerQuery');

const getList = (req, res, next) => {
  const query = req.query.all ? {} : {stopAt: {$gt: Date.now()}};

  const options = {
    limit: itemsPerQuery,
    page: req.query.page || 1,
    sort: '-createdAt',
  };

  models.Room
    .paginate(query, options)
    .then((rooms) => {
      res
        .status(200)
        .json(rooms);

      extendedLog && log.info('Get rooms list');
    })
    .catch(next);
};

const postNew = (req, res, next) => {
  const {minPrice, description} = req.body;

  if (roomCreators.includes(req.user.role)) {
    const room = new models.Room({minPrice, description});

    room
      .save()
      .then((savedRoom) => {
        const location = getUrlForNewResource(req, savedRoom.id);

        const dataForSockets = {
          event: 'New room',
          roomId: savedRoom.id,
          minPrice: savedRoom.minPrice,
          location: location,
        };

        socketServer.emit(dataForSockets);

        extendedLog && log.info(`New room is created with id=${savedRoom.id}`);

        return res
          .set('Location', location)
          .status(201)
          .json({savedRoom});
      })
      .catch(next);
  } else {
    return next(new Errors.Forbidden('Wrong permissions for adding room'));
  }
};

const getById = (req, res, next) => {
  req.requestedRoom
    .populate('bids')
    .execPopulate()
    .then((room) => {
      res
        .status(200)
        .json({room});

      extendedLog && log.info(`Get room id=${room.id}`);
    })
    .catch(next);
};

const deleteById = (req, res, next) => { // For technical reasons
  if (req.user.role !== 'admin') {
    return next(new Errors.Forbidden('Wrong permissions for delete room'));
  }

  req.requestedRoom
    .remove()
    .then(() => {
      res
        .status(200)
        .json({
          message: `Room ${req.requestedRoom.id} deleted`,
        });

      extendedLog && log.info(`Room ${req.requestedRoom.id} deleted`);
    })
    .catch(next);
};

module.exports = {
  getList,
  postNew,
  getById,
  deleteById,
};
