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
    .option('-p, --params', 'JSON params to apply')
    .option('-t, --type', 'Filter by type')
    //.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
    .action(function(args) {
      var docs = [],
        ids = [];
      var params = args.params;
      program.log.info('Passes', params);

      program.global.app().get('db').allDocs().then((resp) => {
        docs = resp.rows.map((row) => {
          return row.doc;
        });
        ids = docs.map((doc) => {
          return doc._id;
        });
        program.log.info('Passes');

        console.log(yaml.dump(ids));
      });
    });
};
