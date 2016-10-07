'use strict';
const _ = require('lodash');

const log = require('npmlog');
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const defaultConfig = require(path.resolve(__dirname, '../config.js'));
const utils = require('./utils');

class Configuration {
  constructor(o) {
    this.defaults = Object.assign({}, defaultConfig, o);
    this.checkEnv(this.defaults);
    return this;
  }

  get(name) {
    if (name) {
      return this.index(this.defaults, name);
    }
    return this.defaults;
  }

  set(name, value) {
    return this.index(this.defaults, name, value);
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

  env(name) {
    var str = _.kebabCase(`${pkg.name}_${name}`);
    str = _.replace(str, /\-/g, '_');
    str = str.toUpperCase();
    return str;
  }

  getEnv(name) {
    let env = this.env(name);
    if (process.env.hasOwnProperty(env)) {
      let val = process.env[env];
      log.info('env', env, val);
      return val;
    }
    return false;
  }

  setEnv(name, value) {
    let env = this.env(name);
    process.env[env] = value;
  }

  hasEnv(name) {
    return (process.env.hasOwnProperty(this.env(name)) ? true : false);
  }

  getOrSetEnv(name, value) {
    if (!this.getEnv(name)) {
      //return this.setEnv(name, value);
    } else {
      return this.getEnv(name);
    }
  }

  /**
   * I check each key in config and see if an enviorment variable is set, if so, I use that value;
   */
  checkEnv(obj) {
    for (var key in obj) {
      if (this.hasEnv(key)) {
        log.info('overriding', key);
        this.defaults[key] = this.getEnv(key);
      }
    }
  }

  /**
   * Take env variable and return config key name
   */
  envToKey(name) {
      var str = String(name).toLowerCase();
      str = _.replace(str, /\_/g, '-').replace(`${pkg.name}-`, '');
      str = _.camelCase(str);
      return str;
    }
    /**
     * Take key and return env name
     */
  keyToEnv(name) {
    return this.env(name);
  }
}

module.exports = Configuration;
