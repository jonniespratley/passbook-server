'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const Router = express.Router;

const expressListRoutes = require('express-list-routes');
const LogController = require('./log-controller');

module.exports = function(app) {
  var program = app.locals.program;
  var logController = new LogController(program);
  var logRouter = new Router();
  const logPrefix = `/api/${program.config.get('version')}/log`;

  //Logging Endpoint
  logRouter.post('/', bodyParser.json(), logController.post_log);

  expressListRoutes({
    prefix: logPrefix
  }, 'API:', logRouter);


  app.use(logPrefix, logRouter);
  return logRouter;
};
