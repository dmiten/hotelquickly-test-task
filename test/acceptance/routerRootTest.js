'use strict';

const request = require('supertest');

const app = require('../../lib/app');
const packageJson = require('../../package.json');

describe('Router functionality', () => {
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
  });
});
