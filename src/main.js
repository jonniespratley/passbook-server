'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const log = require('npmlog');


module.exports = (function(userConfig) {
  const Server = require('./server');
  const PORT = process.env.PORT || 5353;
  const program = require('./program')(userConfig || require('../config'));

  const config = program.get('config');

  Server.setExpressLocals('program', program);
  Server.setExpressLocals('config', config);
  Server.setExpressLocals('db', program.get('db'));
  Server.setExpressMiddleware(program.config.get('middleware'));

  var app = Server.getExpressApp();

  app.set('x-powered-by', false);
  app.set('views', path.resolve(__dirname, '../static/views'));
  app.set('view engine', 'pug');


  const dirs = config.get('publicDir');
  if (dirs && dirs.length) {
    dirs.forEach((dir) => {
      app.use(express.static(dir));
    });
  }


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

  //


// TODO: Load middleware
  app.locals.program = program;
  require('./routes/download')(app);
  require('./routes/browse')(app);


  app.get('/_logs', function(req, res) {
    program.get('db').find({
      docType: 'log'
    }).then((resp) => {
      log.info('Got logs', resp);
      res.render('logs', {
        title: config.name,
        logs: resp
      });
    }).catch((err) => {
      console.log('err', err);
      res.render('500', err);
    });
  });




  Server.getExpressApp().listen(PORT, (err) => {
    if(err){
      throw err;
    }
    console.log('Listening on', PORT);
    require('express-routemap')(app);
    require('express-list-routes')({
      prefix: '/api/v1'
    }, 'API:', app);
  });
  //  program.set('server', Server);
  return program;
})();
