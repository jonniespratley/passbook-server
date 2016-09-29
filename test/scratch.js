'use strict';
const assert = require('assert');
const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash");
const log = require("npmlog");
const request = require("request");
const npmlog = require('npmlog');
const PouchDB = require('PouchDB');
const BASE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io';
const config = require('./test-config');
const Chance = require('chance');
const chance = new Chance();
var remoteDb;

const baseRequest = request.defaults({
	method: 'GET',
	baseUrl: BASE_URL
});

function $http(options) {
  return new Promise(function (resolve, reject) {
    baseRequest(options, function (err, resp, body) {
      if(err){
        reject(err);
      }
      resolve(body);
    });
  });
}

var data = null;



//Sync from local to remote

const db = {
  username: process.env.PASSBOOK_SERVER_DB_USERNAME || 'admin',
  password: process.env.PASSBOOK_SERVER_DB_PASSWORD || 'fred'
};
const database = new PouchDB(`https://${db.username}:${db.password}@pouchdb.run.aws-usw02-pr.ice.predix.io/passbook-server`);
const passbook = require('passbook-cli');
const tempDir = path.resolve(__dirname, './temp');
var certs = {
  p12: path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test.p12'),
  passphrase: 'test'
};

var localDb;
var rawPasses = [];

//Create certs
passbook.createPemFiles(certs.p12, certs.passphrase, tempDir).then((resp) =>{
  console.log('pems', resp);
  certs.key = resp.key.filename;
  certs.cert = resp.cert.filename;
});

//Save all passes to passbook-server.

function saveDocToPassbookServer(doc) {
	log.info('saveDocToPassbookServer', doc._id);
  return $http({
    url: `/api/v1/admin/db/${doc._id}`,
    body: doc,
    json:true,
    method: 'PUT'
  });
}




var index = 0;
//Get all docs
database.allDocs({
  include_docs: true
}).then((resp) =>{

  _.forEach(resp.rows, (row) =>{
    let doc = row.doc;
      if(doc.docType === 'pass'){
        index++;

        doc.teamIdentifier = config.teamIdentifier;
        doc.webServiceURL = config.webServiceURL;
        doc.passTypeIdentifier = config.passTypeIdentifier;
        doc.authenticationToken = chance.guid();
        doc.lastUpdated =  chance.timestamp();
        doc.logoText = `Pass ${index}`;
        doc.organizationName = `Pass ${index}`;

        //Create .raw
        passbook.createPassAssets({
          name: doc._id,
          type: doc.type,
          output: './temp',
          pass: doc
        }).then((out) =>{
          doc.rawpassFilename = out;
          rawPasses.push(out);
          log.info('raw', out);
          //assert(fs.existsSync(out), 'returns .raw filename');

          //Create .pkpass
          passbook.createPkPass(out, certs.cert, certs.key, certs.passphrase).then((pkpass) => {
            log.info('pkpass', pkpass);

             doc.pkpassFilename = pkpass;

            // assert(fs.existsSync(pkpass), 'return .pkpass filename');

            //Save pass to server
            saveDocToPassbookServer(doc).then((res) =>{
              log.info('saved', res.id);

              fs.removeSync(doc.rawpassFilename);
              fs.removeSync(doc.rawpassFilename.replace('.raw', '.zip'));
            });

          }).catch((err) => {
            assert.fail(err);
          });
        });
      }
  });
});










function removeDoc(id, rev) {
	log.info('remove', id, rev);
  return $http({
    url: `/api/v1/admin/db/${id}`,
    method: 'DELETE'
  });
}

function cleanDocs(rows) {
  console.log('Cleaning', rows.length);
	return new Promise((resolve, reject) =>{
    var _docs = [];
  	var _done = _.after(rows.length, function() {
  		console.log('done cleaning');
  		Promise.all(_docs).then(resolve, reject);
  	});
  	_.forEach(rows, function(row) {
      if(row.docType !== 'pass'){
        removeDoc(row._id).then((resp) =>{
          _done();
        });
      }

  	});
  });
}
/*
$http({
  json: true,
  url: '/api/v1/admin/db'}).then(cleanDocs).then((resp) =>{
  log.info('resp', resp);
}).catch((err) =>{
  log.error(err);
});
*/
