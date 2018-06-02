'use strict';

const http = require('http');
const request = require('supertest');

const dbInit = require('../../lib/helpers/db');
const packageJson = require('../../package.json');
const config = require('../../lib/helpers/config');
const socketServer = require('../../lib/helpers/socketServer');
const initialPopulation = require('../../config/initialPopulation');

const mochaTimeout = 15000; // mlab can delay first answer

describe('Flow test', () => {
  const app = require('../../lib/app');

  let client = initialPopulation.clients[0];
  let roomCreator = initialPopulation.users[0];
  let testRoom;
  let testBid;
  let db;

  before((done) => {
    const port = config.get('port:http') || 3000;
    const requestHandler = (req, res) => res.end('Sockets testing');
    const testServer = http.createServer(requestHandler);

    testServer.listen(port);
    socketServer.create(testServer);

    db = dbInit();
    db.connection.on('connected', () => done());
  });

  after((done) =>
    db.connection.close(() =>
      socketServer.close(done)));

  it('Returns status 200 and API version from package.json on GET "/"', () => {
    request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          throw err;
        }

        if (!res.body || !res.body.version || res.body.version !== packageJson.version) {
          throw new Error('Missing body / version info or it incorrect');
        }
      });
  });

  it('Returns status 404 on GET fake URL', () => {
    request(app)
      .get('/something/that/never/will/be/a/real/route')
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (err) {
          throw err;
        }
      });
  });

  describe('Access to main routes is protected', () => {
    it('GET "/bids" without token mast be failed', () => {
      request(app)
        .get('/bids')
        .expect(401)
        .end((err, res) => {
          if (err) {
            throw err;
          }
        });
    });

    it('GET "/rooms" without token mast be failed', () => {
      request(app)
        .get('/rooms')
        .expect(401)
        .end((err, res) => {
          if (err) {
            throw err;
          }
        });
    });

    it('authorization process for getting token', (done) => {
      request(app)
        .post('/auth')
        .type('form')
        .send({
          grant_type: 'password',
          client_id: client.clientId,
          client_secret: client.clientSecret,
          username: roomCreator.username,
          password: roomCreator.password,
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            throw err;
          }

          roomCreator.accessToken = res.body.access_token;
          roomCreator.refreshToken = res.body.refresh_token;

          done();
        });
    }).timeout(mochaTimeout);

    it('auth user can POST new room for auction', (done) => {
      const dateNow = new Date(Date.now());

      request(app)
        .post('/rooms')
        .set('Authorization', `Bearer ${roomCreator.accessToken}`)
        .type('form')
        .send({
          minPrice: 10,
          description: `Pretty cozy test room ${dateNow.toLocaleString()}.${dateNow.getUTCMilliseconds()}}`,
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          testRoom = res.body.savedRoom;

          done();
        });
    }).timeout(mochaTimeout);

    it('auth user can not POST new improper bid', (done) => {
      request(app)
        .post('/bids')
        .set('Authorization', `Bearer ${roomCreator.accessToken}`)
        .type('form')
        .send({
          roomId: testRoom._id,
          price: testRoom.currentPrice,
        })
        .expect(422)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          done();
        });
    }).timeout(mochaTimeout);

    it('auth user can POST new proper bid', (done) => {
      request(app)
        .post('/bids')
        .set('Authorization', `Bearer ${roomCreator.accessToken}`)
        .type('form')
        .send({
          roomId: testRoom._id,
          price: testRoom.minPrice * 2,
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          testBid = res.body.savedBid;

          done();
        });
    }).timeout(mochaTimeout);

    it('auth user can GET list of rooms with active auction', (done) => {
      request(app)
        .get('/rooms')
        .set('Authorization', `Bearer ${roomCreator.accessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          done();
        });
    }).timeout(mochaTimeout);

    it('auth user can GET LIST of all rooms (including inactive)', (done) => {
      request(app)
        .get('/rooms?all=true')
        .set('Authorization', `Bearer ${roomCreator.accessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          done();
        });
    }).timeout(mochaTimeout);

    it('auth user can GET one room (by id)', (done) => {
      request(app)
        .get(`/rooms/${testRoom._id}`)
        .set('Authorization', `Bearer ${roomCreator.accessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          done();
        });
    }).timeout(mochaTimeout);

    it('auth user can GET one bid (by id)', (done) => {
      request(app)
        .get(`/bids/${testBid._id}`)
        .set('Authorization', `Bearer ${roomCreator.accessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          done();
        });
    }).timeout(mochaTimeout);

    it('auth user can renew obsolete token', (done) => {
      request(app)
        .post('/auth')
        .type('form')
        .send({
          grant_type: 'refresh_token',
          client_id: client.clientId,
          client_secret: client.clientSecret,
          refresh_token: roomCreator.refreshToken,
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            throw err;
          }

          roomCreator.accessToken = res.body.access_token;
          roomCreator.refreshToken = res.body.refresh_token;

          done();
        });
    }).timeout(mochaTimeout);
  });
});
