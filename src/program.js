'use strict';
const fs = require('fs-extra');
const debug = require('debug');
const _ = require('lodash');
const userHome = require('user-home');
const http = require('http');
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const defaultConfig = require(path.resolve(__dirname, '../config.js'));

const Configuration = require('./configuration');
const utils = require('./utils');
const logger = utils.getLogger('program');
const passbook = require('passbook-cli');

const DB = require('./db');

const PouchDB = require('pouchdb');
const PouchDbAdapter = require('./db-pouchdb');
//const CouchDB = require('./db-couchdb');

var Pass = require(path.resolve(__dirname, 'routes/passes/pass.js'));
var Passes = require(path.resolve(__dirname, 'routes/passes/passes.js'));
var Device = require(path.resolve(__dirname, 'routes/devices/device.js'));
var db;
var instance = null;
/**
 * @class Program
 * @description The main program that starts server.
 */
class Program {

	/**
	 * constructor - Create a new instance of the program.
	 *
	 * @param  {type} config description
	 * @return {type}        description
	 */
	constructor(config) {
		this.db = db;
		this.pkg = pkg;
		this.getLogger = utils.getLogger;
		this.modules = {};
	//	config = config || defaultConfig;
		logger('constructor', config);

		if (config instanceof Configuration) {
			this.config = config;
		} else {
			this.config = new Configuration(config);
		}
		var dbPath = this.config.get('database.dataPath');
		try {
			fs.ensureDirSync(dbPath);
		} catch (e) {
			dbPath = path.resolve(__dirname, '../db/', this.config.get('database.name'));
			logger('Trying to create another directory', dbPath);
			fs.ensureDirSync(dbPath);
		} finally {
			db = config.adapter || new PouchDbAdapter(dbPath);
      this.db = db;
		}


		this.set('db', db);
		this.set('config', this.config);
		this.set('log', logger);
		this.set('passbook', passbook);
		this.set('utils', utils);
		this.set('dbPath', dbPath);
		this.set('Device', Device);
		this.set('Pass', Pass);
		this.set('Passes', Passes);
		this.set('FileDB', DB);
		//this.set('passes', Passes(this));

		this.log = require('npmlog');
		this.server = null;

	}

	sync(params) {
		return new Promise((resolve, reject) => {
			params = _.assign({
				to: this.get('dbPath'),
				from: this.config.get('database.url')
			}, params);
			var localUrl = params.to;
			var remoteUrl = params.from;
			logger('sync', params);
			var sync = PouchDB.sync(localUrl, remoteUrl, {}).on('change', function(info) {
				logger('change', info.direction, info.change);
			}).on('complete', function(info) {
				//log.info('complete', info);
				resolve(info);
			}).on('uptodate', function(info) {
				logger('uptodate', info);
				resolve(info);
			}).on('error', function(err) {
				logger('error', err);
				reject(err);
			});
		});
	}

	/**
	 * require - Require a module in local directory
	 *
	 * @param  {type} name description
	 * @return {type}      description
	 */
	require(name) {
		return require(path.resolve(__dirname, name));
	}

	/**
	 * get - Get access to a loaded module.
	 *
	 * @param  {String} name The name of the module
	 * @return {*}      The instance of the module
	 */
	get(name) {
		logger('get', name);
		return this.modules[name];
	}

	/**
	 * set - Set a module for the program.
	 *
	 * @param  {type} name   description
	 * @param  {type} module description
	 * @return {type}        description
	 */
	set(name, module) {
		logger('set', name);
		this.modules[name] = module;
		return this;
	}

	/**
	 * getDb - Get access to the database.
	 *
	 * @return {type}  description
	 */
	getDb() {
		return db;
	}

	/**
	 * @static getInstance - Get an instance of this module.
	 *
	 * @param  {type} c description
	 * @return {type}   description
	 */
	static getInstance(c) {
		if (instance) {
			logger('getInstance', 'returning existing instance');
			return instance;
		} else {
			logger('getInstance', 'creating new instance', c);
			instance = new Program(c);
			return instance;
		}
	}

}

exports.Program = Program;
module.exports = function(c) {
	return Program.getInstance(c);
};
