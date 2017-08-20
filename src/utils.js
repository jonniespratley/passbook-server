'use strict';
const request = require('request');
const path = require('path');
const crypto = require('crypto');
const pkg = require(path.resolve(__dirname, '../package.json'));
const debug = require('debug');

/**
 * @class utils
 * @description Simple utilites use by the app.
 */
class Utils {
  constructor(){
  }


  /**
   * index - Gets the index of an ojbect.
   *
   * @param  {type} obj   description
   * @param  {type} is    description
   * @param  {type} value description
   * @return {type}       description
   */
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


  /**
   * checksum - Create a checksum hash.
   *
   * @param  {type} str       description
   * @param  {type} algorithm description
   * @param  {type} encoding  description
   * @return {type}           description
   */
  checksum(str, algorithm, encoding) {
  	return crypto
  		.createHash(algorithm || 'md5')
  		.update(str, 'utf8')
  		.digest(encoding || 'hex')
  }

  /**
   * getLogger - Creates a new namespaces 'debug' log instance.
   *
   * @param  {String} name The name of the logger.
   * @return {Object}  Instance of `debug` module.
   */
  getLogger(name) {
  	return debug(pkg.name + ':' + name);
  }
}
module.exports = new Utils();
