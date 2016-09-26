'use strict';
const Log = require('./log');

class LogController {
  constructor() {

  }
  post_log(req, res) {
    var data = {
      body: JSON.stringify(req.body),
      params: req.params,
      url: req.path,
      _id: 'log-' + Date.now().toString(),
      type: 'log',
      time: Date.now().toString()
    };
    req.app.locals.db.put(new Log(data)).then((msg) => {
      res.status(201).json(msg);
    }, function(err) {
      res.status(400).json(err);
    });
  }
}

module.exports = LogController;
