'use strict';

let passport = require('passport');

module.exports = passport.authenticate('bearer', {session: false});
