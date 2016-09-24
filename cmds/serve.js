/* serve commander component
 * To use add require('../cmds/serve.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';


module.exports = function(program, options) {
	const path = require('path');
	const express = require('express');

	const PORT = process.env.PORT || program.config.get('port') || 5353;
	const host = process.env.VCAP_APP_HOST || program.config.get('host');
	const Server = require('../src/server');

	program.command('serve')
		.version('0.0.1')
		.description('An express server for handling Passbook APIs')
		.action(function(args) {
			Server.setExpressLocals('program', program.global.program);
			Server.setExpressLocals('db', program.global.db);
			Server.setExpressMiddleware([
				path.resolve(__dirname, '../src/routes/devices'),
				path.resolve(__dirname, '../src/routes/passes')
			]);
			Server.getExpressApp().listen(PORT, (err) => {
				program.log.info('Listening on', PORT);
			});
		});

};
