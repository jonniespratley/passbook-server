'use strict';

class AdminController {
  constructor(app) {
    console.log('AdminController', 'constructor');
  }
  index(req, res, next) {
    var docs = [];
    req.app.locals.program.get('db').allDocs({
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
      req.app.locals.program.get('db').get(req.id).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    } else {
      req.app.locals.program.get('db').find(req.query).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    }
  }
  put(req, res, next) {
    req.app.locals.program.get('db').put(req.body).then(function(resp) {
      console.log('put success', resp);
      res.status(200).json(resp);
    }).catch(function(err) {
      console.log('put error', err);
      res.status(404).json(err);
    });
  }
  post(req, res, next) {
    req.app.locals.program.get('db').post(req.body).then(function(resp) {
      res.status(201).json(resp);
    }).catch(function(err) {
      res.status(404).json(err);
    });
  }
  del(req, res, next) {
    req.app.locals.program.get('db').remove(req.id, req.query.rev).then(function(resp) {
      res.status(200).json(resp);
    }).catch(function(err) {
      res.status(404).json(err);
    });
  }
  all(req, res, next) {
    console.log('adminController', 'all', req.method, req.query);
    next();
  }
  postPass(req, res) {
    req.app.locals.program.get('passes').save(req.body).then(function(resp) {
      res.status(201).json(resp);
    }).catch(function(err) {
      res.status(404).json(err);
    });
  }
}

module.exports = AdminController;
