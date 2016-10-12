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
  const adminPrefix = `/_admin`;

  adminRouter.param('id', function(req, res, next, id) {
    req.id = id;
    next();
  });

  adminRouter.use(adminController.use);
  adminRouter.get('/', adminController.index);
  adminRouter.route('/db/:id?')
    .all(function(req, res, next) {
      next();
    })
    .get(adminController.get)
    .put(bodyParser.json(), adminController.put)
    .post(bodyParser.json(), adminController.post)
    .delete(adminController.del);

    adminRouter.get('/sync?', function(req, res) {
      program.sync(req.query).then((resp) =>{
        res.status(200).send(resp);
      }, (err)=>{
        res.status(400).send(err);
      });
    });


  expressListRoutes({
    prefix: adminPrefix
  }, 'API:', adminRouter);

  app.use(bodyParser.json());
  app.use(adminPrefix, adminRouter);
  return adminRouter;
};
