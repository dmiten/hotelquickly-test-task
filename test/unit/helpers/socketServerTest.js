'use strict';

const http = require('http');
const expect = require('chai').expect;
const clientIo = require('socket.io-client');

const config = require('../../../lib/helpers/config');
const testData = require('../../fixtures/socketServerData.json');
const socketServer = require('../../../lib/helpers/socketServer');

const socketOptions = {
  transports: ['websocket'],
  reconnection: false,
  forceNew: true,
};

const isTokenValidStub = (auth) => auth
  ? (token, cb) => cb(null, {valid: true, message: 'Authenticated'})
  : (token, cb) => cb(null, {valid: false, message: 'Unauthenticated'});

const port = config.get('port:http') || 3000;
const socketUrl = `http://localhost:${port}`;
const requestHandler = (req, res) => res.end('Sockets testing');
const socketAuthTimeout = config.get('security:socketAuthTimeout');

describe('Socket server functionality', () => {
  it('Client with valid token can connect to "news" group and receive messages there', (done) => {
    const testServer = http.createServer(requestHandler);
    testServer.listen(port);

    socketServer.create(testServer, isTokenValidStub(true));
    const client = clientIo.connect(socketUrl, socketOptions);

    client
      .on('connect', () => client.emit('auth', {token: 'testToken'}))
      .on('auth', () => socketServer.emit('news', testData.room))
      .on('New room', (data) => {
        expect(data).to.deep.equal(testData.room);
        client.disconnect();
        socketServer.close(done);
      });
  });

  it('Client with token can initiate new room with auction and receive messages there', (done) => {
    const testServer = http.createServer(requestHandler);
    testServer.listen(port);

    socketServer.create(testServer, isTokenValidStub(true));
    const client = clientIo.connect(socketUrl, socketOptions);

    client
      .on('connect', () => client.emit('auth', {token: 'testToken'}))
      .on('auth', () => {
        client
          .emit('join', testData.room.roomId, () =>
            socketServer.emit(testData.room.roomId, testData.bid));
      })
      .on('New bid', (data) => {
        expect(data).to.deep.equal(testData.bid);
        client.disconnect();
        socketServer.close(done);
      });
  });

  it(`Client without token will be disconnected in ${socketAuthTimeout}ms`, (done) => {
    const testServer = http.createServer(requestHandler);
    testServer.listen(port);

    socketServer.create(testServer, isTokenValidStub(false));
    const client = clientIo.connect(socketUrl, socketOptions);

    client
      .on('disconnect', () => socketServer.close(done));
  });

  it(`Client with invalid token can not pass auth and will be disconnected in ${socketAuthTimeout}ms`, (done) => {
    const testServer = http.createServer(requestHandler);
    testServer.listen(port);

    socketServer.create(testServer, isTokenValidStub(false)); // false means invalid token
    const client = clientIo.connect(socketUrl, socketOptions);

    client
      .on('connect', () => client.emit('auth', {token: 'testToken'}))
      .on('disconnect', () => socketServer.close(done));
  });
});
