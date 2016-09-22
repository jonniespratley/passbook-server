/* serve commander component
 * To use add require('../cmds/serve.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var express = require('express'),
requireHelper = require('../require_helper'),
app = null,
cloudServices = null, dbcreds = null, dbconn = null;


module.exports = function(program, options) {

	var port = process.env.PORT || program.config.get('port'),
        host = process.env.VCAP_APP_HOST || program.config.get('host');

	var config = {
		port: port,
		host: host,
		baseUrl: program.config.get('baseUrl'),
		publicDir: program.config.get('publicDir'),
		staticDir: program.config.get('staticDir'),
		database: {
			name: process.env.MONGODB_NAME || program.config.get('database.name'),
			url: process.env.MONGODB_URL || program.config.get('database.url')
		}
	};

	program.command('serve')
		.version('0.0.1')
		.description('An express server for handling Passbook APIs')
		.action(function(args) {

		//New app instance
		app = express();

		//Load routes
		//requireHelper('lib/routes/jps-passbook-routes')( config, app );
		//requireHelper('lib/routes/rest-resource-routes')( config, app );

		//Start the server
		app.listen(config.port, function() {
			program.log.info('Server running @ ' + config.host + ':' + config.port);
		});

	});

};
