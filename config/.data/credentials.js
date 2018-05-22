'use strict';

const fs = require('fs');

const log = require('../../lib/helpers/log')(module);

const getCredentials = () => {
  try {
    const pathToSecret = process.cwd() + '/config/.data/';
    const cert = fs.readFileSync(pathToSecret + './cert.pem', {encoding: "utf8"});
    const key =  fs.readFileSync(pathToSecret + './key.pem', {encoding: "utf8"});
  
    log.info('Getting credentials - ok');
    
    return {cert, key}
  } catch (err) {
    log.error('getting credentials ', err.message)
  }
};

module.exports = getCredentials;

/*

It's better to use nginx (for example) for HTTPS because of several reasons and disable HTTPS feature in config.json.
But this solution is self-sufficient and we need HTTPS for proper authentication process.
So you can put certificate and key in separate files to the 'pathToSecret'.
The following structure of those files is expected:

  cert.pem =
  -----BEGIN CERTIFICATE-----
  ...
  ...
  ...
  -----END CERTIFICATE-----

  key.pem =
  -----BEGIN RSA PRIVATE KEY-----
  ...
  ...
  ...
  -----END RSA PRIVATE KEY-----

*/
