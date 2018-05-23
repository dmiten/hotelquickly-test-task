'use strict';

const models = require('../models');
const Errors = require('../helpers/errors');
const config = require('../helpers/config');
const log = require('../helpers/log')(module);

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
    })
    .catch((err) => next(err));
};

const postNew = (req, res, next) => {
  if (roomCreators.includes(req.user.role)) {
    const room = new models.Room(req.body);

    const location = (id) =>
      `${req.protocol}://${req.hostname}:${req.app.settings.port}${req.originalUrl}/${id}`;

    room
      .save()
      .then((room) => {
        res
          .set('Location', location(room.id))
          .status(201)
          .json({room});

        extendedLog && log.info(`New room is created with Id=${room.id}`);
      })
      .catch((err) => next(err));
  } else {
    return next(new Errors.Forbidden('Wrong permissions for adding room'));
  }
};

const getById = (req, res, next) => {};

module.exports = {
  getList,
  postNew,
  getById,
};
