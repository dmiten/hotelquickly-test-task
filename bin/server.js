'use strict';

const http = require('http');
const https = require('https');
const express = require('express');

require('../lib/db');

const config = require('../lib/config');
const log = require('../lib/log')(module);
const app = require('../lib/app');

const getCredentials = require('../config/.data/credentials');
let credentials;

if (config.get('useHttps')) {
  credentials = getCredentials();
}

if (credentials) {
  const httpApp = express();
  httpApp.set('port', process.env.PORT || config.get('port:http') || 3000);
  app.set('port', process.env.PORT || config.get('port:https') || 3443);

  httpApp.get('*', (req, res) => {
    res.redirect('https://' + req.hostname + ':' + app.get('port') + req.url);
    log.info('redirected to HTTPS');
  });

  const server = https.createServer(credentials, app);

  server.listen(app.get('port'), () => {
    log.info('Express HTTPS server listening on port ' + app.get('port'));
  });
} else {
  app.set('port', process.env.PORT || config.get('port:http') || 3000);

  const server = http.createServer(app);

  server.listen(app.get('port'), () => {
    log.info('Express HTTP server listening on port ' + app.get('port'));
  });
}
