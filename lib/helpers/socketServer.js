'use strict';

// todo cleaning for obsolete rooms

const socketIo = require('socket.io');

const config = require('./config');
const log = require('./log')(module);

const extendedLog = config.get('extendedLog');
let socketServer;

const create = (server) => {
  socketServer = socketIo.listen(server);

  socketServer.sockets.on('connection', (socket) => {
    socket.join('news');
    socket.on('join', (roomId, emit) => {
      socket.join(roomId);
      emit(roomId, {event: roomId});
    });

    extendedLog && log.info('New client connected to "news" room');
  });

  log.info('Socket server started');
};

const emit = (roomId, data) => {
  if (socketServer.sockets.adapter.rooms[roomId]) {
    socketServer.sockets
      .in(roomId)
      .emit(data.event, data);

    extendedLog && log.info(`Socket server emit to "${roomId}": ${data.event}`);
  }
};

module.exports = {
  create,
  emit,
};
