'use strict';

const models = require('../models');
const Errors = require('../helpers/errors');
const config = require('../helpers/config');
const socketServer = require('../helpers/socketServer');
const log = require('../helpers/log')(module);
const isIdValid = require('../utils/isIdValid');
const getUrlForNewResource = require('../utils/getUrlForNewResource');

const extendedLog = config.get('extendedLog');
const itemsPerQuery = config.get('db:itemsPerQuery');

const getList = (req, res, next) => {
  const query = {};

  const options = {
    limit: itemsPerQuery,
    page: req.query.page || 1,
    sort: 'createdAt',
  };

  models.Bid
    .paginate(query, options)
    .then((bids) => {
      res
        .status(200)
        .json(bids);

      extendedLog && log.info('Get bids list');
    })
    .catch(next);
};

const postNew = (req, res, next) => { // todo nested promises -> async/await?
  if (!isIdValid(req.body.roomId)) {
    next(new Errors.Unprocessable('Wrong roomId format'));
  }

  const bid = new models.Bid({
    roomId: req.body.roomId,
    price: req.body.price,
    userId: req.user.id,
  });

  models.Room
    .findById(bid.roomId)
    .then((targetRoom) => {
      if (targetRoom.stopAt < Date.now()) { // todo is it better to use validation errors from mongoose?
        return next(new Errors.Unprocessable('This auction is finished'));
      }

      const minPrice = targetRoom.currentPrice || targetRoom.minPrice;

      if (bid.price - minPrice < minPrice * 0.05) {
        return next(new Errors.Unprocessable('Inadequate price'));
      }

      return bid
        .save()
        .then((savedBid) => {
          targetRoom.currentPrice = savedBid.price;
          targetRoom.currentBid = savedBid.id;
          targetRoom.bids.push(savedBid.id);

          return targetRoom
            .save()
            .then((updatedRoom) => {
              const location = getUrlForNewResource(req, savedBid.id);

              const dataForSockets = {
                event: 'New bid',
                roomId: updatedRoom.id,
                currentBidId: updatedRoom.currentBid,
                currentPrice: updatedRoom.currentPrice,
                location: location,
              };

              socketServer.emit('news', dataForSockets);
              socketServer.emit(`${updatedRoom.id}`, dataForSockets);

              extendedLog && log.info(`New bid is created with id=${savedBid.id}`);

              return res
                .set('Location', location)
                .status(201)
                .json({savedBid});
            });
        });
    })
    .catch(next);
};

const getById = (req, res, next) => {
  req.requestedBid
    .populate('roomId')
    .execPopulate()
    .then((bid) => {
      res
        .status(200)
        .json({bid});

      extendedLog && log.info(`Get bid id=${bid.id}`);
    })
    .catch(next);
};

module.exports = {
  getList,
  postNew,
  getById,
};
