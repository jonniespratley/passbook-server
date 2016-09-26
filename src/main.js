'use strict';
module.exports = (function() {
  const Server = require('./server');
  const config = require('../config');
  const PORT = process.env.PORT || 5353;
  const program = require('./program')(config);
  program.log.info('main.js');

  Server.setExpressLocals('program', program);
  Server.setExpressLocals('config', program.config.get());
  Server.setExpressLocals('db', program.get('db'));
  Server.setExpressMiddleware([
    './routes/admin',
    './routes/log',
    './routes/devices',
    './routes/passes'
  ]);
  Server.getExpressApp().listen(PORT, (err) => {
    console.log('Listening on', PORT);
  });
  return Server;
})();
