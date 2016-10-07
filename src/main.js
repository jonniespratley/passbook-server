'use strict';
const express = require('express');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const log = require('npmlog');
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
  app.use(express.static('public'));
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


  app.get('/download/:id', function(req, res) {
    var pkpassFilename = `${req.params.id}.pkpass`;
    var filename = path.resolve(__dirname, '../temp', pkpassFilename);
    fs.ensureDirSync(path.dirname(filename));
    program.get('db').getAttachment(req.params.id, pkpassFilename).then((file) => {
      fs.writeFile(filename, file, (err) => {
        res.set('Content-Type', 'application/pkpass');
        res.sendFile(filename);
      });
    }).catch((err) => {
      res.send(err);
    });
  });

  var browseRouter = new require('express').Router();

  browseRouter.route('/_browse/:id?')
    .get(function(req, res) {
      var passes = [];

      if (req.params.id) {
        program.get('db').get(req.params.id).then((resp) => {
          log.info('Got pass', resp);
          res.render('pass', {
            title: config.name,
            pass: resp
          });
        }).catch((err) => {
          log.error('err', err);
          res.render('error', err);
        });
      } else {
        program.get('db').allDocs({
          docType: 'pass'
        }).then((resp) => {
          var doc;
          for (var i = 0; i < resp.rows.length; i++) {
            doc = resp.rows[i].doc;
            if(doc.webServiceURL){
              passes.push(doc);
            }
          }
          log.info('Got passes', resp);
          res.render('browse', {
            title: config.name,
            passes: passes
          });
        }).catch((err) => {
          console.log('err', err);
          res.render('error', err);
        });
      }
    });
  app.use('/', browseRouter);


  app.get('/bad', function(req, res) {
    unknownMethod();
  });



  Server.getExpressApp().listen(PORT, (err) => {
    console.log('Listening on', PORT);
  });
  //  program.set('server', Server);
  return program;
})();
