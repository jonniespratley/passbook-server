/**
 * @author Jonnie Spratley
 * @created 09/22/16
 */
'use strict';
const express = require('express');
const pug = require('pug');
const util = require('util');
const path = require('path');
const serveStatic = require('serve-static');
const log = require('npmlog');

var NotFound = (msg) => {
	this.name = 'NotFound';
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
};
//util.inherits(NotFound, Error);

class Server {
	constructor(app) {
		if (!app) {
			app = express();
		}



		this.app = app;
	}


	setExpressMiddleware(middleware) {
		if (!middleware) {
			return this;
		}
		middleware.forEach((m) => {
			log.info('Server', 'setExpressMiddleware', m);
			try {
				require(m)(this.app);
			} catch (e) {
				log.error('setExpressMiddleware', 'could not mount', m);
				log.error('setExpressMiddleware', e);
			}
		});
		return this;
	}

	getExpressApp() {
		return this.app;
	}

	setExpressLocals(name, value) {
		log.info('Server', 'setExpressLocals', name);
		this.app.locals[name] = value;
		return this;
	}

	startExpressServer(port, done) {
		this.app.listen(port, function(err) {
			log.info('Server', 'listening on', host + ':' + port);
			done(err, this.app);
		});
	}
}


module.exports = new Server();
