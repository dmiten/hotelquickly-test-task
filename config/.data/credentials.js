'use strict';

const fs = require('fs');

const log = require('../../lib/log')(module);

const getCredentials = () => {
  try {
    const pathToSecret = process.cwd() + '/config/.data/';
    const cert = fs.readFileSync(pathToSecret + './cert.pem', {encoding: "utf8"});
    const key =  fs.readFileSync(pathToSecret + './key.pem', {encoding: "utf8"});
  
    log.info('getting credentials ok');
    
    return {cert, key}
  } catch (err) {
    log.error('getting credentials ', err.message)
  }
};

module.exports = getCredentials;
