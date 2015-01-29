/* serve commander component
 * To use add require('../cmds/serve.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

module.exports = function(program) {

	program
		.command('serve')
		.version('0.0.1')
		.description('An express server for handling Passbook APIs')
		.action(function(/* Args here */){
			// Your code goes here
		});
	
};