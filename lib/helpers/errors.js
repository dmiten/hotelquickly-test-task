'use strict';

function httpError(httpStatus, defaultMessage) {
  return function(event) {
    Error.captureStackTrace(this, this.constructor);

    this.message = event || defaultMessage;
    this.httpStatus = httpStatus;

    this.toJSON = function() {
      return {error: this.message};
    };
  };
}

module.exports = {
  Bad: httpError(400, 'Bad request'),
  Forbidden: httpError(403, 'Forbidden'),
  NotFound: httpError(404, 'Not found'),
  Unprocessable: httpError(422, 'Unprocessable'),
};
