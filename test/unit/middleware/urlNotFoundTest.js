'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;

const middleware = require('../../../lib/middlewares/urlNotFound');

describe('Middleware `urlNotFound`', () => {
  it('correct call next() with httpStatus = 404', () => {
    const req = {};
    const res = {};
    const next = sinon.spy();

    middleware(req, res, next);
    expect(next.args[0][0].httpStatus === 404);
  });
});
