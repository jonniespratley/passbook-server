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


class Program {
	constructor(config) {
		log.heading = pkg.name;

    if( config instanceof Configuration){
      this.config = config;

    }else {
      this.config = new Configuration(config);
    }


		log.info('config', this.config);





    var dbPath = path.resolve(this.config.get('database.path'), './', this.config.get('database.name'));
    fs.ensureDirSync(dbPath);


    db = config.adapter || new PouchDbAdapter(this.config.get('database.path') || this.config.get('database.url'), {
        ajax: {
          auth: {
            username: this.config.get('database.username'),
            password: this.config.get('database.password'),
            sendImmediately: false
          }
        }
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
