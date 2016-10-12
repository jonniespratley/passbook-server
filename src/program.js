'use strict';
const fs = require('fs-extra');
const debug = require('debug');
const _ = require('lodash');
const userHome = require('user-home');
const http = require('http');
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const defaultConfig = require(path.resolve(__dirname, '../config.js'));
const DB = require('./db');
const Configuration = require('./configuration');
const utils = require('./utils');
const logger = utils.getLogger('program');
const log = require('npmlog');
const passbook = require('passbook-cli');


const PouchDB = require('pouchdb');
const PouchDbAdapter = require('./db-pouchdb');
const CouchDB = require('./db-couchdb');

var Pass = require(path.resolve(__dirname, 'routes/passes/pass.js'));
var Passes = require(path.resolve(__dirname, 'routes/passes/passes.js'));
var Device = require(path.resolve(__dirname, 'routes/devices/device.js'));
var db;
/**
 * @class
 */
var instance = null;
class Program {
	constructor(config) {
		log.heading = pkg.name;

		if (config instanceof Configuration) {
			this.config = config;
		} else {
			this.config = new Configuration(config);
		}
    log.info('Program.constructor');
		log.info('config', this.config);

		var dbPath = path.resolve(__dirname, '../temp', this.config.get('database.path'), this.config.get('database.name'));
		fs.ensureDirSync(dbPath);


		db = config.adapter || new PouchDbAdapter(dbPath);

		this.db = db;
		this.pkg = pkg;
		this.getLogger = utils.getLogger;

		this.modules = {};
		this.set('Device', Device);
		this.set('Pass', Pass);
		this.set('Passes', Passes);
		this.set('db', db);
		this.set('config', this.config);
		this.set('log', log);
		this.set('passbook', passbook);
		this.set('utils', utils);
    this.set('dbPath', dbPath);

		this.log = log;
		this.server = null;

    instance = this;
	}

  sync(params){
    return new Promise((resolve, reject) =>{
      params = _.extend({
          to: this.get('dbPath'),
          from: this.config.get('database.url')
      }, params);
      var localUrl = params.to;
      var remoteUrl = params.from;
      log.info('sync', params);


      var sync = PouchDB.sync(localUrl, remoteUrl, {})
        .on('change', function(info) {
          log.info('change', info.direction, info.change);
        }).on('complete', function(info) {
          log.info('complete', info);
          resolve(info);
        }).on('uptodate', function(info) {
          log.info('uptodate', info);
          resolve(info);
        }).on('error', function(err) {
          log.error('error', err);
          reject(err);
        });
    });
  }

	require(name) {
		return require(path.resolve(__dirname, name));
	}

	get(name) {
		logger('get', name);
		return this.modules[name];
	}

	set(name, module) {
		logger('set', name);
		this.modules[name] = module;
		return this;
	}

	getDb() {
		return db;
	}

  static getInstance(c){
    if(instance){
      log.info('getInstance', 'returning existing instance');
      return instance;
    } else {
      log.info('getInstance', 'creating new instance');
      return new Program(c);
    }
  }

}


module.exports = function(c) {
	return Program.getInstance(c);
};
