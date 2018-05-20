'use strict';

const request = require('supertest');

const app = require('../../lib/app');

describe('Router root', () => {
  describe('GET /', () => {
    it('returns json {\'status\':\'OK\'}', () => {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, {
          status: 'OK',
        });
    });
  });

  describe('GET /foo/bar', () => {
    it('returns status 404', () => {
      request(app)
        .get('/foo/bar')
        .expect(404);
    });
  });
});
