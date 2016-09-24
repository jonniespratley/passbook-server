/**
 * @author Jonnie Spratley
 * @created 09/22/16
 */
'use strict';
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const log = require('npmlog');


class Server {
	constructor() {
		var app = express();
		this.app = app;
	}

	setExpressMiddleware(middleware) {
		try {
			middleware.forEach((m) => {
				log.info('use middleware', m);
				require(m)(this.app);
			});
		} catch (e) {
			log.error('mount', 'could not mount', m);
		}
		return this;
	}

	getExpressApp() {
		return this.app;
	}

	setExpressLocals(name, value) {
		log.info('Server', 'setExpressLocals', name, value);
		this.app.locals[name] = value;
		return this;
	}

	startExpressServer(port, done) {
		this.app.listen(port, function(err) {
			log.info('listening on', host + ':' + port);
			done(err, this.app);
		});
	}
}


module.exports = new Server();
