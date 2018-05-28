'use strict';

// todo cleaning for obsolete rooms

const socketIo = require('socket.io');

const config = require('./config');
const log = require('./log')(module);
const Errors = require('./errors.js');
const isTokenValid = require('../utils/isTokenValid.js');

const extendedLog = config.get('extendedLog');
let socketServer;

const create = (server, checkToken = isTokenValid) => {
  socketServer = socketIo.listen(server);

  socketServer
    .use((socket, next) => {
      if (socket.handshake.query && socket.handshake.query.token) {
        checkToken(socket.handshake.query.token)
          .then((result) =>
            result.valid
              ? next()
              : next(new Errors.Unauthorized(result.message)));
      } else {
        next(new Errors.Unauthorized('No token provided'));
      }
    })
    .on('connection', (socket) => {
      socket
        .join('news')
        .on('join', (roomId, emit) => {
          socket.join(roomId);
          emit(roomId, {event: roomId});
        });

      extendedLog && log.info('New client connected to "news" room');
    });

  log.info('Socket server started');
};

const emit = (roomId, data) => {
  if (socketServer.sockets.adapter.rooms[roomId]) {
    socketServer
      .in(roomId)
      .emit(data.event, data);

    extendedLog && log.info(`Socket server emit to "${roomId}": ${data.event}`);
  }
};

module.exports = {
  create,
  emit,
};
