'use strict';

const http = require('http');
const expect = require('chai').expect;
const socketClient = require('socket.io-client');

const config = require('../../../lib/helpers/config');
const testData = require('../../fixtures/socketServerData.json');
const socketServer = require('../../../lib/helpers/socketServer');

const socketOptions = {
  transports: ['websocket'],
  forceNew: true,
};

const isTokenValidStub = (auth) => auth
  ? () => Promise.resolve({valid: true, message: 'Authenticated'})
  : () => Promise.resolve({valid: false, message: 'Unauthenticated'});

const port = config.get('port:http') || 3000;
const requestHandler = (req, res) => res.end('Sockets testing');
const testServer = http.createServer(requestHandler);

testServer.listen(port, (err) => {
  if (err) {
    console.log(err.message);
  }
});

describe('Socket server functionality', () => {
  const socketUrl = `http://localhost:${port}?token=testToken`;
  let client = null;

  before((done) => {
    socketServer.create(testServer, isTokenValidStub(true));
    done();
  });

  beforeEach((done) => {
    client = socketClient.connect(socketUrl, socketOptions);
    done();
  });

  afterEach((done) => {
    client.disconnect();
    done();
  });

  it('Client with token can connect to "news" group and receive messages there', (done) => {
    client = socketClient.connect(socketUrl, socketOptions);

    client.on('connect', () => {
      socketServer.emit('news', testData.room);
    });

    client.on('New room', (data) => {
      expect(data).to.deep.equal(testData.room);
      client.disconnect();
      done();
    });
  });

  it('Client with token can initiate new room with auction and receive messages there', (done) => {
    client = socketClient.connect(socketUrl, socketOptions);

    client.on('connect', () => {
      client.emit('join', testData.room.roomId, () => {
        socketServer.emit(testData.room.roomId, testData.bid);
      });
    });

    client.on('New bid', (data) => {
      expect(data).to.deep.equal(testData.bid);
      client.disconnect();
      done();
    });
  });
});
