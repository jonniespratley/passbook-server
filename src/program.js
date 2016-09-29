'use strict';
const debug = require('debug');
const _ = require('lodash');
const http = require('http');
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const defaultConfig = require(path.resolve(__dirname, '../config.js'));
const DB = require('./db');



const utils = require('./utils');
const logger = utils.getLogger('program');

const log = require('npmlog');


const PouchDbAdapter = require('./db-pouchdb');
const CouchDB = require('./db-couchdb');

var Pass = require(path.resolve(__dirname, 'routes/passes/pass.js'));
var Passes = require(path.resolve(__dirname, 'routes/passes/passes.js'));
var Device = require(path.resolve(__dirname, 'routes/devices/device.js'));
var db;
/**
 * @class
 */
class Program {
	constructor(config) {
		log.heading = pkg.name;

		this.config = {
			defaults: _.assign(defaultConfig, config),
			get: (name) => {
				if (name) {
					return this.config.defaults[name];
				}
				return this.config;
			}
		};

		logger('config', this.config);

		db = config.adapter || new DB(this.config.dataPath, {
			//type: 'single'
		});

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

		this.log = log;
		this.server = null;
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

}


module.exports = function(c) {
	return new Program(c);
};
