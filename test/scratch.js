'use strict';
const assert = require('assert');
const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash");
const log = require("npmlog");
const async = require('async');
const request = require("request");
const npmlog = require('npmlog');
const PouchDB = require('PouchDB');
const Chance = require('chance');
const chance = new Chance();

const Pass = require(path.resolve(__dirname, '../src/routes/passes/pass'));


const BASE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io';
const REMOTE_BASE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io';

const passbook = require('passbook-cli');
const db = {
  name: 'passbook-cli',
  username: process.env.PASSBOOK_SERVER_DB_USERNAME || 'admin',
  password: process.env.PASSBOOK_SERVER_DB_PASSWORD || 'fred'
};


const config = require('./test-config');



const baseRequest = request.defaults({
  method: 'GET',
  baseUrl: BASE_URL
});

function $http(options) {
  return new Promise(function (resolve, reject) {
    baseRequest(options, function (err, resp, body) {
      if (err) {
        reject(err);
      }
      resolve(body);
    });
  });
}

var data = null;
var rawPasses = [];

//const database = new PouchDB(`https://${db.username}:${db.password}@pouchdb.run.aws-usw02-pr.ice.predix.io/passbook-cli`);

const tempDir = path.resolve(__dirname, './temp');
var certs = {
  p12: path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test.p12'),
  passphrase: 'test'
};




function createCerts() {
  //Create certs
  passbook.createPemFiles(certs.p12, certs.passphrase, tempDir).then((resp) => {
    console.log('pems', resp);
    certs.key = resp.key.filename;
    certs.cert = resp.cert.filename;
  });
}

createCerts();
//Save all passes to passbook-server.
//const localdb = new PouchDB(path.resolve(__dirname, '../db'));


function removeDoc(doc) {
  log.info('remove', doc._id);
  return $http({
    baseUrl: REMOTE_BASE_URL,
    url: `/api/v1/admin/db/${doc._id}?rev=${doc._rev}`,
    method: 'DELETE'
  });
}

function cleanDocs(rows) {
  console.log('Cleaning', rows.length);
  return new Promise((resolve, reject) => {
    var _docs = [];
    var _done = _.after(rows.length, function () {
      console.log('done cleaning');
      Promise.all(_docs).then(resolve, reject);
    });
    _.forEach(rows, function (row) {
      removeDoc(row).then((resp) => {
        console.log('cleaned', resp);
        _done();
      });
    });
  });
}




const dbName = 'passbook-cli';
const localUrl = `http://${db.username}:${db.password}@localhost:4987/${db.name}`;
const remoteUrl = `https://${db.username}:${db.password}@pouchdb.run.aws-usw02-pr.ice.predix.io/${db.name}`;
const localDb = new PouchDB(localUrl);
const remoteDb = new PouchDB(remoteUrl);


var saveDocAttachment = (doc, filename) => {
  return new Promise((resolve, reject) => {
    localDb.get(doc._id).then((existingDoc) => {
      doc._rev = existingDoc._rev;
      localDb.putAttachment(doc._id, `${doc._id}.zip`, existingDoc._rev, fs.readFileSync(filename), 'application/pkpass',
        function (err, res) {
          log.error('putAttachment', err);
          if (err) {
            reject(err);
          }
          resolve(res);
        });
    }).catch((err) => {
      reject(err);
    });
  });
};


var saveDocToPassbookServer = (doc) => {
  log.info('saveDocToPassbookServer', doc._id);
  return localDb.get(doc._id).then((existingDoc) => {
    log.info('saving', existingDoc._id);
    doc._rev = existingDoc._rev;
    return localDb.put(doc);
  }).catch((err) => {
    delete doc._rev;
    return localDb.put(doc);
  });
};



var index = 0;


/**
 * getRemotePassesAndAddLocal - Get all remote passes, and add to local db
 *
 * @return {type}  description
 */
function getRemotePassesAndAddLocal() {

  //Get all docs
  localDb.allDocs({
    include_docs: true,
    limit: 150
  }).then((resp) => {
    log.info('creating ', resp.rows.length, 'passes');

    _.forEach(resp.rows, (row) => {
      let doc = row.doc;
      let passType = 'generic';

      if (doc.eventTicket) {
        passType = 'eventTicket';
      }
      if (doc.coupon) {
        passType = 'coupon';
      }
      if (doc.boardingPass) {
        passType = 'boardingPass';
      }

      if (doc.storeCard) {
        passType = 'storeCard';
      }

      index++;
      doc.docType = 'pass';
      doc.passType = passType;
      doc.teamIdentifier = config.teamIdentifier;
      doc.webServiceURL = config.webServiceURL;
      doc.passTypeIdentifier = config.passTypeIdentifier;
      //doc.authenticationToken = chance.guid();
      doc.lastUpdated = chance.timestamp();

      assert(doc.passType, 'has docType');

      doc = new Pass(doc);

      localDb.put(doc).then(function (resp) {


				//TODO Create .raw
        passbook.createPassAssets({
          name: doc._id,
          type: doc.passType || 'generic',
          output: path.resolve(__dirname, '../temp'),
          pass: doc
        }).then((out) => {

          doc.rawpassFilename = out;
          rawPasses.push(out);
          log.info('raw', out);

          assert(fs.existsSync(out), 'returns .raw filename');


          //TODO 1 - Create .pkpass
          passbook.createPkPass(out, certs.cert, certs.key, certs.passphrase).then((pkpass) => {
            log.info('pkpass', pkpass);
            doc.pkpassFilename = pkpass;
						doc.zipFilename = doc.rawpassFilename.replace('.raw', '.zip');


            assert(fs.existsSync(pkpass), 'return .pkpass filename');

            //TODO - 2 Save pass to server
            saveDocToPassbookServer(doc).then((res) => {
              log.info('saved', res);

              //fs.removeSync(doc.rawpassFilename.replace('.raw', '.zip'));

							saveDocAttachment(doc, doc.pkpassFilename).then((d) => {
                log.info('done', d);
              }).catch((err) => {
                log.error('saved', err);
              });

            }).catch((err) => {
              log.error('saved', err);
            });

          }).catch((err) => {
            assert.fail(err);
          });

        });
      });



    });
  });





}




function syncDbs() {
  var sync = PouchDB.sync(localUrl, remoteUrl, {
      live: true
    })
    .on('change', function (info) {
      log.info('change', info);
    }).on('complete', function (info) {
      log.info('complete', info);
    }).on('uptodate', function (info) {
      // handle up-to-date
      log.info('uptodate', info);

    }).on('error', function (err) {
      log.error('error', err);
    });


  sync.cancel();
}


function cleanLogs() {
  remoteDb.allDocs({
    include_docs: true
  }).then((resp) => {
    for (var i = 0; i < resp.rows.length; i++) {
      let doc = resp.rows[i].doc;
      log.info('remove doc', doc._id);
      if (doc.docType === 'log') {
        remoteDb.remove(doc._id, doc._rev).then((res) => {
          log.info('Removed', res);
        });
      }
    }
  }).catch((err) => {
    log.error(err);
  });
}





getRemotePassesAndAddLocal();
//syncDbs();
