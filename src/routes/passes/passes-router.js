'use strict';
var express = require('express'),
  bodyParser = require('body-parser'),
  Router = express.Router,
  jsonParser = bodyParser.json();


const expressListRoutes = require('express-list-routes');
const PassController = require('./passes-controller');

module.exports = function(app) {
  const program = app.locals.program;
  var logger = program.getLogger('router:passes');
  var config = program.config.get();

  const prefix = `/api/${program.config.defaults.version}/passes`;


  var passController = new PassController(program);
  var router = new Router();


  router.get('/:pass_type_id/:serial_number?', passController.get_passes);

  app.use(prefix, router);

  expressListRoutes({
    prefix: prefix
  }, 'API:', router);


  return router;
};
