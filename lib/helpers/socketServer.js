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
    socket
      .join('news')
      .on('join', (data) => socket.join(data.roomId));

    extendedLog && log.info('New client connected to "news" room');
  });

  log.info('Socket server started');
};

const emit = (id, data) => {
  if (socketServer.sockets.rooms.indexOf(id) >= 0) {
    socketServer.sockets
      .to(id)
      .emit(data);

    extendedLog && log.info(`Socket server emit to ${id}: ${data.message}`);
  }
};

module.exports = {
  create,
  emit,
};
