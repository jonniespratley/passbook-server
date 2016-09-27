/* passes commander component
 * To use add require('../cmds/passes.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';
const yaml = require('node-yaml');
module.exports = function(program) {

  program
    .command('passes')
    .version('0.0.1')
    .description('Simple actions on a pass.')
    .option('-l, --list', 'List passes')
    .option('-t, --type', 'Filter by type')
    //.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
    .action(function(args) {
      program.global.db.allDocs().then((resp) => {
        console.log(yaml.dump(resp))
      });
    });
};
