'use strict';
const request = require('request');
const path = require('path');
const crypto = require('crypto');
const pkg = require(path.resolve(__dirname, '../package.json'));
const debug = require('debug');

class Utils {
  constructor(){
  }

  index(obj, is, value) {
    if (typeof is === 'string') {
      return this.index(obj, is.split('.'), value);
    } else if (is.length === 1 && value !== undefined) {
      obj[is[0]] = value;
      return obj;
    } else if (is.length === 0) {
      return obj;
    } else {
      return this.index(obj[is[0]], is.slice(1), value);
    }
  }

  checksum(str, algorithm, encoding) {
  	return crypto
  		.createHash(algorithm || 'md5')
  		.update(str, 'utf8')
  		.digest(encoding || 'hex')
  }
  getLogger(name) {
  	return debug(pkg.name + ':' + name);
  }
}
module.exports = new Utils();
