'use strict';

class AdminController {
  constructor(app) {
    console.log('AdminController', 'constructor');
  }
  index(req, res, next) {
    console.log('adminController', 'index', req.url);
    res.status(200).json({
      message: 'Admin index'
    });
  }
  use(req, res, next) {
    console.log('adminController', 'use', req.url);
    next();
  }
  db(req, res, next) {
    console.log('adminController', 'db', req.method, req.url);
    next();
  }
  get(req, res, next) {
    console.log('adminController', 'db', req.method, req.url);
    if (req.params.id) {
      req.app.locals.db.get(req.params.id).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    } else {
      req.app.locals.db.find(req.query).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    }

  }
  put(req, res, next) {
    console.log('adminController', 'db', req.method, req.url);
    req.app.locals.db.put(req.body, req.params.id).then(function(resp) {
      res.status(200).json(resp);
    }).catch(function(err) {
      res.status(404).json(err);
    });
  }
  post(req, res, next) {
    console.log('adminController', 'db', req.method, req.url);
    req.app.locals.db.post(req.body).then(function(resp) {
      res.status(201).json(resp);
    }).catch(function(err) {
      res.status(404).json(err);
    });
  }
  delete(req, res, next) {
    console.log('adminController', 'db', req.method, req.url);
    req.app.locals.db.remove(req.id, req.query.rev).then(function(resp) {
      res.status(200).json(resp);
    }).catch(function(err) {
      res.status(404).json(err);
    });
  }
  all(req, res, next) {
    console.log('adminController', 'all', req.method, req.query);
    next();
  }
}

module.exports = AdminController;
