'use strict';
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const Router = express.Router;
const expressListRoutes = require('express-list-routes');
const AdminController = require('./admin-controller');

module.exports = function(app) {
  var program = app.locals.program;
  var adminController = new AdminController(program);
  var adminRouter = new Router();
  const adminPrefix = `/api/${program.config.get('version')}/admin`;

  adminRouter.param('id', function(req, res, next, id) {
    req.id = id;
    console.log('CALLED ONLY ONCE', id);
    next();
  });

  //Logging Endpoint
  adminRouter.use(adminController.use);
  adminRouter.get('/', adminController.index);
  adminRouter.route('/db/:id?')
    .all(function(req, res, next) {
      // runs for all HTTP verbs first
      // think of it as route specific middleware!
      next();
    })
    .get(adminController.get)
    .put(bodyParser.json(), adminController.put)
    .post(bodyParser.json(), adminController.post)
    .delete(adminController.delete);


  expressListRoutes({
    prefix: adminPrefix
  }, 'API:', adminRouter);

  app.use(bodyParser.json());

  app.use(adminPrefix, adminRouter);
  return adminRouter;
};
