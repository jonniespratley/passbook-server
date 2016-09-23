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
		if (!config) {
			config = defaultConfig;
		}

		config = _.assign(defaultConfig, config);


		log.info('config', 'db', config.dataPath);

		var db = config.adapter || new DB(config.dataPath);

		this.db = db;
		this.pkg = pkg;
		this.log = log;
		this.getLogger = utils.getLogger;
		this.utils = utils;
		this.Device = Device;
		this.Pass = Pass;
		this.Passes = Passes;
		this.config = {
			defaults: config
		};

		this.server = null;
		this.modules = {
			db: db
		};
	}
	require(name) {
		return require(path.resolve(__dirname, name));
	}

	getDb() {
		var db = new DB.FileDataStore(this.config.dataPath);
		return db;
	}
}


module.exports = function(c) {
	return new Program(c);
};
