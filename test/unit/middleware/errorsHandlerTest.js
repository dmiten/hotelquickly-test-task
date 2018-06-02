'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;

const Errors = require('../../../lib/helpers/errors');
const middlewares = require('../../../lib/middlewares');

describe('Middleware `errorHandler`', function() {
  let res;
  let req;

  beforeEach(() => {
    req = {method: 'GET'};
    res = {
      status: function() {
        return this;
      },
      json: sinon.spy(),
    };

    res.status = sinon.spy(res.status);
  });

  [
    {
      name: 'Bad request',
      Error: Errors.Bad,
      httpStatus: 400,
    },
    {
      name: 'Unauthorized',
      Error: Errors.Unauthorized,
      httpStatus: 401,
    },
    {
      name: 'Forbidden',
      Error: Errors.Forbidden,
      httpStatus: 403,
    },
    {
      name: 'Not Found',
      Error: Errors.NotFound,
      httpStatus: 404,
    },
    {
      name: 'Unprocessable',
      Error: Errors.Unprocessable,
      httpStatus: 422,
    },
  ].forEach((testCase) => {
    it(`correct process '${testCase.name}' error`, () => {
      const err = new testCase.Error();

      middlewares.errorsHandler(err, req, res);
      expect(res.status.calledWith(testCase.httpStatus));
      expect(res.json.calledWithMatch({
        error: err.message,
      }));
    });
  });

  it('correct unknown error', () => {
    const customMessage = 'Unknown message';
    const err = new Error(customMessage);
    const httpStatus = 500;

    middlewares.errorsHandler(err, req, res);

    expect(res.status.calledWith(httpStatus));
    expect(res.json.calledWithMatch({
      error: customMessage,
    }));
  });
});
