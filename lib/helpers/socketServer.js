'use strict';

const Server = require('socket.io');

const config = require('./config');
const log = require('./log')(module);

const extendedLog = config.get('extendedLog');

let io;

const create = (server) => {
  io = new Server(server);

  io.on('connection', (socket) => {
    socket.emit('socket', 'Connected');

    extendedLog && log.info('Emit on connection');
  });

  log.info('Create socket server - ok');
};

const emit = ({id, data}) => {
  io.emit(id, data);

  extendedLog && log.info(`Socket server emit ${data} for ${id}`);
};

module.exports = {
  create,
  emit,
};
