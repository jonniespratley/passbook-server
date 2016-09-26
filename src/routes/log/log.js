'use strict';
const _ = require('lodash');
class Log {
  constructor(o) {
    let defaults = {
      docType: 'log',
      time: Date.now().toString()
    };
    _.assign(this, defaults, o);
  }
}
module.exports = Log;
