'use strict';

const nconf = require('nconf');

nconf.argv().env().file({file: process.cwd() + '/config/config.json'});

module.exports = nconf;
