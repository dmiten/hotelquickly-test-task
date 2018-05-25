'use strict';

module.exports = (req, id) =>
  `${req.protocol}://${req.hostname}:${req.app.settings.port}${req.originalUrl}/${id}`;
