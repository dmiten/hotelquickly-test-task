'use strict';

const http = require('http');
const expect = require('chai').expect;
const socketIo = require('socket.io-client');

const testData = require('../../fixtures/socketServerData.json');
const socketServer = require('../../../lib/helpers/socketServer');

const port = 4000;
const requestHandler = (req, res) => res.end('socketServer testing');
const testServer = http.createServer(requestHandler);

const socketUrl = 'http://localhost:4000';
const options = {
  transports: ['websocket'],
  forceNew: true,
};

describe('socketServer', () => {
  before((done) => {
    testServer.listen(port, (err) => {
      if (err) {
        console.log(err.message);
      }

      socketServer.create(testServer);
      done();
    });
  });

  it('Client can connect to "news" group and receive messages there', (done) => {
    const client = socketIo.connect(socketUrl, options);

    client.on('connect', () => {
      client.on('New room', (data) => {
        expect(data).to.deep.equal(testData.room);
        client.disconnect();
        done();
      });

      socketServer.emit('news', testData.room);
    });
  });

  it('Client can initiate new room with auction and receive messages there', (done) => {
    const client = socketIo.connect(socketUrl, options);

    client.on('connect', () => {
      client.on('New bid', (data) => {
        expect(data).to.deep.equal(testData.bid);
        client.disconnect();
        done();
      });

      client.emit('join', testData.room.roomId, () => {
        socketServer.emit(testData.room.roomId, testData.bid);
      });
    });
  });
});
