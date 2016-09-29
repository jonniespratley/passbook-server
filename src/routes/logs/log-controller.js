'use strict';
const Log = require('./log');

class LogController {
  constructor() {

  }
  post_log(req, res) {
    var data = {
      body: req.body,
      params: req.params,
      url: req.url,
      _id: 'log-' + Date.now().toString()
    };
    req.app.locals.db.put(new Log(data)).then((msg) => {
      res.status(201).json(msg);
    }, function(err) {
      res.status(400).json(err);
    });
  }
}

module.exports = LogController;
