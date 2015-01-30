/* serve commander component
 * To use add require('../cmds/serve.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var express = require('express'), requireHelper = require('../require_helper'), app = null, cloudServices = null, dbcreds = null, dbconn = null;


module.exports = function(program, options) {

	var port = process.env.PORT || program.config.get('port'),
			host = process.env.VCAP_APP_HOST || program.config.get('host');

	var config = {
		port: port,
		host: host,
		baseUrl: program.config.get('baseUrl'),
		database: {
			url: process.env.MONGODB_URL || program.config.get('database.url')
		}
	};

	console.log('serve initialized', config);

	program.command('serve')
		.version('0.0.1')
		.description('An express server for handling Passbook APIs')
		.action(function() {

		//New app instance
		app = express();

		//Load routes
		requireHelper('lib/jps-passbook-routes')( config, app );

		//Start the server
		app.listen(config.port, function() {
			console.log(config.message + ' running @ ' + config.host + ':' + config.port);
		});

	});

};
