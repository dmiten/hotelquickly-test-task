'use strict';

// todo cleaning for obsolete rooms

require('http-shutdown').extend();
const _ = require('underscore');
const socketIo = require('socket.io');

const config = require('./config');
const log = require('./log')(module);
const isTokenValid = require('../utils/isTokenValid.js');

const extendedLog = config.get('extendedLog');
const socketAuthTimeout = config.get('security:socketAuthTimeout');

let httpServer;
let socketServer;

const create = (server, checkToken = isTokenValid) => {
  httpServer = server.withShutdown();
  socketServer = socketIo.listen(httpServer);

  _.each(socketServer.nsps, (nsp) => {
    nsp.on('connect', (socket) => {
      if (!socket.auth) {
        delete nsp.connected[socket.id];
      }
    });
  });

  socketServer
    .on('connection', (socket) => {
      socket
        .on('auth', ({token}) => {
          socket.auth = false;

          if (token) {
            checkToken(token, (err, result) => {
              if (!err && result.valid) {
                socket.auth = true;

                _.each(socketServer.nsps, (nsp) => {
                  if (_.findWhere(nsp.sockets, {id: socket.id})) {
                    nsp.connected[socket.id] = socket;
                  }
                });

                socket
                  .emit('auth', 'Authenticated')
                  .on('join', (roomId, emit) => {
                    socket.join(roomId);
                    emit(roomId, {event: roomId});
                  })
                  .join('news');

                extendedLog && log.info('New client auth & connected to "news" room');
              } else {
                socket.disconnect(result.message);
                extendedLog && log.error('Socket auth failed');
              }
            });
          } else {
            socket.disconnect('No token provided');
            extendedLog && log.error('No token provided');
          }
        });

      setTimeout(() => {
        if (!socket.auth) {
          socket.disconnect('Unauthorized');
          extendedLog && log.error('Socket auth timeout');
        }
      }, socketAuthTimeout);
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

const close = (cb = () => {}) => {
  socketServer
    .close(() => {
      httpServer
        .shutdown(() => {
          extendedLog && log.info('Socket server is cleanly shutdown');
          cb();
        });
    });
};

module.exports = {
  create,
  emit,
  close,
};
