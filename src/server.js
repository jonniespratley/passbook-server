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


/**
 * Server class provides methods for managing express server.
 */
class Server {
	constructor(app) {
		if (!app) {
			app = express();
		}
		this.app = app;
	}

	/**
	 * setExpressMiddleware - Set middleware on the app
	 *
	 * @param  {type} middleware description
	 * @return {type}            description
	 */
	setExpressMiddleware(middleware) {
		if (!middleware) {
			return this;
		}
		middleware.forEach((m) => {
			try {
				require(m)(this.app);
			} catch (e) {
				log.error('setExpressMiddleware', m, e);
			}
		});
		return this;
	}


	/**
	 * getExpressApp - Get the express app instance
	 *
	 * @return {Object} Express app instance
	 */
	getExpressApp() {
		return this.app;
	}


	/**
	 * setExpressLocals - Set a local key/val on the express app
	 *
	 * @param  {String} name   the name of the key
	 * @param  {*} value       the value of the key
	 * @return {*}          the server
	 */
	setExpressLocals(name, value) {
		this.app.locals[name] = value;
		return this;
	}


	/**
	 * startExpressServer - Start the express server.
	 *
	 * @param  {Number} port the port number
	 * @param  {Function} done callback function
	 */
	startExpressServer(port, done) {
		this.app.listen(port, function(err) {
			log.info('Server', 'listening on', host + ':' + port);
			done(err, this.app);
		});
	}
}


module.exports = new Server();
