'use strict';
const Server = require('./server');
const config = require('../config');
const PORT = process.env.PORT || 5353;
const program = require('./program')(config);



Server.setExpressLocals('program', program);
Server.setExpressLocals('db', instance.db);
Server.setExpressMiddleware([
  './routes/devices',
  './routes/passes'
]);
Server.getExpressApp().listen(PORT, (err) => {
  console.log('Listening on', PORT);
});
