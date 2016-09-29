'use strict';
const _ = require('lodash');
class Log {
  constructor(o) {
    let defaults = {
      docType: 'log',
      created: Date.now().toString()
    };
    _.assign(this, defaults, o);
  }
}
module.exports = Log;
