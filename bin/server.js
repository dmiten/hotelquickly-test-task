'use strict';

const http = require('http');
const https = require('https');
const express = require('express');

require('../lib/db');

const app = require('../lib/app');
const config = require('../lib/config');
const log = require('../lib/log')(module);
const socketServer = require('../lib/socketServer');

const getCredentials = require('../config/.data/credentials');

const credentials = config.get('useHttps') ? getCredentials() : null;

let server;

if (credentials) {
  app.set('port', process.env.PORT || config.get('port:https') || 3443);

  const httpApp = express();
  httpApp.set('port', process.env.PORT || config.get('port:http') || 3000);

  httpApp.get('*', (req, res) => {
    res.redirect('https://' + req.hostname + ':' + app.get('port') + req.url);
    log.info('Redirected to HTTPS');
  });

  http.createServer(httpApp)
    .listen(httpApp.get('port'), () =>
      log.info('Express HTTP server listening on port ' + httpApp.get('port'))
    );

  server = https.createServer(credentials, app);

  server.listen(app.get('port'), () =>
    log.info('Express HTTPS server listening on port ' + app.get('port'))
  );
} else {
  app.set('port', process.env.PORT || config.get('port:http') || 3000);

  server = http.createServer(app);

  server.listen(app.get('port'), () =>
    log.info('Express HTTP server listening on port ' + app.get('port'))
  );
}

socketServer.create(server);
