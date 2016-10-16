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
  Server.setExpressLocals('config', config);
  Server.setExpressLocals('db', program.get('db'));
  Server.setExpressMiddleware(program.config.get('middleware'));

  var app = Server.getExpressApp();

  app.set('x-powered-by', false);
  app.set('views', path.resolve(__dirname, '../public/views'));
  app.set('view engine', 'pug');


  var dirs = config.get('publicDir');
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
  // Download will create the pass assets and pkpass and send the .pkpass
  app.get('/download/:id', function(req, res) {
    var certs = {
      p12: path.resolve(__dirname,
        '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test.p12'),
      cert: path.resolve(__dirname,
        '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test-cert.pem'),
      key: path.resolve(__dirname,
        '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test-key.pem'),
      passphrase: 'test'
    };

    if (!fs.existsSync(certs.cert)) {
      program.get('passbook').createPemFiles(certs.p12, certs.passphrase, path.dirname(certs.p12)).then((resp) => {
        console.log('pems', resp);
        certs.key = resp.key.filename;
        certs.cert = resp.cert.filename;
      });
    }

    var pkpassFilename = `${req.params.id}.pkpass`;
    var filename = path.resolve(__dirname, '../temp', pkpassFilename);

    program.get('db').get(req.params.id).then((doc) => {

      //TODO Create .raw
      program.get('passbook').createPassAssets({
        name: doc._id,
        type: doc.passType || doc.type || 'generic',
        output: path.resolve(__dirname, '../temp/passes'),
        pass: doc
      }).then((out) => {
        log.info('Created .raw', out);
        program.get('passbook').createPkPass(out, certs.cert, certs.key, certs.passphrase).then((pkpass) => {
          res.set('Content-Type', 'application/vnd.apple.pkpass');
          res.download(pkpass);
        }).catch((err) => {
          log.error('error', err);
          res.send(err);
        });
      }).catch((err) => {
        log.error('error', err);
        res.send(err);
      });

    });
    /*
        program.get('db').getAttachment(req.params.id, pkpassFilename).then((file) => {
          fs.ensureDirSync(path.dirname(filename));
          fs.writeFile(filename, file, (err) => {
            if(err){
              res.status(400).send(err);
            }
            res.set('Content-Type', 'application/pkpass');
            res.download(filename);
          });

        }).catch((err) => {
          res.send(err);
        });
        */
  });

  // TODO: Extract
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
            if (doc.webServiceURL) {
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
          res.render('500', err);
        });
      }
    });
  app.use('/', browseRouter);


  app.get('/_logs', function(req, res) {
    var logs = [];
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

  app.get('/bad', function(req, res) {
    unknownMethod();
  });



  Server.getExpressApp().listen(PORT, (err) => {
    console.log('Listening on', PORT);
  });
  //  program.set('server', Server);
  return program;
})();
