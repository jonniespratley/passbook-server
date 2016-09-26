'use strict';
const debug = require('debug');
const _ = require('lodash');
const http = require('http');
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const defaultConfig = require(path.resolve(__dirname, '../config.js'));
const DB = require('./db');
const CouchDB = require('./db-couchdb');
const utils = require('./utils');
const logger = utils.getLogger('program');

const log = require('npmlog');

var Pass = require(path.resolve(__dirname, 'routes/passes/pass.js'));
var Passes = require(path.resolve(__dirname, 'routes/passes/passes.js'));
var Device = require(path.resolve(__dirname, 'routes/devices/device.js'));

/**
 * @class
 */
class Program {
	constructor(config) {
		log.heading = pkg.name;

		this.config = {
			defaults: _.assign({
				version: 'v1'
			}, config),
			get: (name) => {
				if (name) {
					return this.config.defaults[name];
				}
				return this.config;
			}
		};

		log.info('config', this.config);

		var db = this.config.adapter || new DB(this.config.dataPath);

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
		this.set('utils', utils);
		this.log = this.get('log');
		this.server = null;

	}
	require(name) {
		return require(path.resolve(__dirname, name));
	}

	get(name) {
		log.info('get', name);
		return this.modules[name];
	}

	set(name, module) {
		log.info('set', name);
		this.modules[name] = module;
		return this;
	}

	getDb() {
		var db = new DB.FileDataStore(this.config.dataPath);
		return db;
	}
}


module.exports = function(c) {
	return new Program(c);
};
