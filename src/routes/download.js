'use strict';
const express = require('express');
const fs = require('fs-extra');
const path = require('path');

module.exports = function(app) {
  const program = app.locals.program;
  const log = program.getLogger('download-router');
  const config = program.get('config').defaults;

  var DownloadRouter = new express.Router();

  // Download will create the pass assets and pkpass and send the .pkpass
  DownloadRouter.get('/_download/:id',(req, res) => {
    log(req.url, 'start download', config);
    var certs = config.certs;
    log('Certs', certs);

    try {
      if (!fs.existsSync(certs.cert)) {
        program.get('passbook').createPemFiles(certs.p12, certs.passphrase, path.dirname(certs.p12)).then((resp) => {
          log('pems', resp);
          certs.key = resp.key.filename;
          certs.cert = resp.cert.filename;
        }).catch(err => console.error(err));
      }
    } catch (e) {

    }

    var pkpassFilename = `${req.params.id}.pkpass`;
    var filename = path.resolve(config.tempDir, pkpassFilename);

    program.get('db').get(req.params.id).then((doc) => {

      //TODO Create .raw
      program.get('passbook').createPassAssets({
        name: doc._id,
        type: doc.passType || doc.type || 'generic',
        output: path.resolve(config.tempDir, './passes'),
        pass: doc
      }).then((out) => {
        log('Created .raw', out);
        program.get('passbook').createPkPass(out, certs.cert, certs.key, certs.passphrase).then((pkpass) => {
          log('Created .pkpass', pkpass);
          res.set('Content-Type', 'application/vnd.apple.pkpass');
          res.download(pkpass);
        }).catch((err) => {
          log('error', err);
          res.status(404).json(err);
        });
      }).catch((err) => {
        log('error', err);
        res.status(404).json(err);
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
  app.use('/', DownloadRouter);
  return DownloadRouter;
};
