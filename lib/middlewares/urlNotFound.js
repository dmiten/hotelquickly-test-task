'use strict';

const Errors = require('../helpers/errors');

module.exports = (req, res, next) => next(new Errors.NotFound());
