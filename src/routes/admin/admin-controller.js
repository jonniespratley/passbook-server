'use strict';

class AdminController {
  constructor(app) {
    console.log('AdminController', 'constructor');
  }
  index(req, res, next) {
    var docs = [];
    req.app.locals.db.allDocs({
      include_docs: true
    }).then(function(resp) {
      docs = resp;
      res.status(200).render('admin/index', {
        docs: docs
      });
    }).catch(function(err) {
      res.status(404).send(err);
    });
  }
  get(req, res, next) {
    if (req.id) {
      req.app.locals.db.get(req.id).then(function(resp) {
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
    req.app.locals.db.put(req.body).then(function(resp) {
      console.log('put success', resp);
      res.status(200).json(resp);
    }).catch(function(err) {
      console.log('put error', err);
      res.status(404).json(err);
    });
  }
  post(req, res, next) {
    req.app.locals.db.post(req.body).then(function(resp) {
      res.status(201).json(resp);
    }).catch(function(err) {
      res.status(404).json(err);
    });
  }
  del(req, res, next) {
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
