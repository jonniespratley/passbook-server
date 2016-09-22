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

/**
 * @class
 */
class Program {
	constructor(config) {

		if (!config) {
			config = defaultConfig;
		}

		config = _.assign(defaultConfig, config);
		var db = new DB.FileDataStore(config.dataPath);

		this.pkg = pkg;
		this.log = logger;
		this.getLogger = utils.getLogger;
		this.utils = utils;
		
		this.config = {
			defaults: config
		};
		this.db = db;
		this.server = null;
		this.modules = {
			db: db
		};
	}
	require(name) {
		return require(path.resolve(__dirname, name));
	}
}


module.exports = function(c) {
	return new Program(c);
};
