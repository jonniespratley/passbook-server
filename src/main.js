'use strict';
const path = require('path');
const yaml = require('js-yaml');

module.exports = (function(userConfig) {
  const Server = require('./server');

  const PORT = process.env.PORT || 5353;
  const program = require('./program')(userConfig || require('../config'));

  var config = program.get('config');

  Server.setExpressLocals('program', program);
  Server.setExpressLocals('config', program.get('config'));
  Server.setExpressLocals('db', program.get('db'));
  Server.setExpressMiddleware(program.config.get('middleware'));

  var app = Server.getExpressApp();

  app.set('x-powered-by', false);
  app.set('views', path.resolve(__dirname, '../public/views'));
  app.set('view engine', 'pug');

  function indexRoute(req, res) {
    let data = {
      title: config.get('name'),
      message: config.get('message')
    };

    res.format({
      'text/plain': function() {
        res.send();
      },

      'text/html': function() {
        res.render('index', data);
      },

      'application/json': function() {
        res.json(data);
      },

      'default': function() {
        // log the request and respond with 406
        res.status(406).send('Not Acceptable');
      }
    });
  }

  app.get('/', indexRoute);
  app.get('/api/v1', indexRoute);

  app.get('/404', function(req, res) {
    res.status(404).render('404', {
      title: '404',
      message: 'The route you requested was not found!'
    });
  });

  app.get('/500', function(req, res) {
    res.render('500', {
      title: '500',
      message: 'The fatal error!'
    });
  });

  app.get('/bad', function(req, res) {
    unknownMethod();
  });



  Server.getExpressApp().listen(PORT, (err) => {
    console.log('Listening on', PORT);
  });
  //  program.set('server', Server);
  return program;
})();
