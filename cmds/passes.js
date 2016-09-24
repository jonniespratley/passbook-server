/* passes commander component
 * To use add require('../cmds/passes.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';
const yaml = require('node-yaml');
module.exports = function (program) {

  program
    .command('passes')
    .version('0.0.1')
    .description('Simple actions on a pass.')
    .option('-p, --peppers', 'Add peppers')
    .option('-P, --pineapple', 'Add pineapple')
    .option('-b, --bbq-sauce', 'Add bbq sauce')
    .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
    .action(function (args) {

  //    console.log(program.global);

      // Your code goes here
      var o = {
        pizza:{
          peppers: args.peppers,
          cheese: args.cheese,
          bbqSauce: args.bbqSauce
        }
      }

      console.log('you ordered:\n');
      console.log(yaml.dump(o))


    });

};
