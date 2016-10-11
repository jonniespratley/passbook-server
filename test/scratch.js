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

const config = require('./test-config');
const Pass = require(path.resolve(__dirname, '../src/routes/passes/pass'));


const BASE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io';
const REMOTE_BASE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io';

const passbook = require('passbook-cli');
const db = {
  name: 'passbook-server',
  username: process.env.PASSBOOK_SERVER_DB_USERNAME || 'admin',
  password: process.env.PASSBOOK_SERVER_DB_PASSWORD || 'fred'
};



const localUrl = `http://${db.username}:${db.password}@localhost:4987/${db.name}`;
const remoteUrl = `https://${db.username}:${db.password}@pouchdb.run.aws-usw02-pr.ice.predix.io/${db.name}`;
const localDb = new PouchDB(localUrl);
const remoteDb = new PouchDB(remoteUrl);
PouchDB.debug('');

const baseRequest = request.defaults({
  method: 'GET',
  baseUrl: BASE_URL
});

function $http(options) {
  return new Promise(function(resolve, reject) {
    baseRequest(options, function(err, resp, body) {
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
    var _done = _.after(rows.length, function() {
      console.log('done cleaning');
      Promise.all(_docs).then(resolve, reject);
    });
    _.forEach(rows, function(row) {
      removeDoc(row).then((resp) => {
        console.log('cleaned', resp);
        _done();
      });
    });
  });
}



var saveDocAttachment = (doc, filename) => {
  return new Promise((resolve, reject) => {
    localDb.get(doc._id).then((existingDoc) => {
      doc._rev = existingDoc._rev;

      localDb.putAttachment(existingDoc._id,
        `${doc._id}.pkpass`,
        existingDoc._rev,
        fs.readFileSync(filename),
        'application/pkpass',
        function(err, res) {
          assert(res.ok, 'saves attachment');
          log.info('putAttachment', res.ok);
          if (err) {
            log.error('putAttachment', err);
            reject(err);
          }
          resolve(res);
        });
    }).catch((err) => {
      log.error('get', err);
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


/****
https://developer.apple.com/library/content/documentation/UserExperience/Conceptual/PassKit_PG/PassPersonalization.html#//apple_ref/doc/uid/TP40012195-CH12-SW2
*/
var personalizationFilename = 'personalization.json';
var personalization = {
  "requiredPersonalizationFields": [
    "PKPassPersonalizationFieldName",
    "PKPassPersonalizationFieldPostalCode",
    "PKPassPersonalizationFieldEmailAddress",
    "PKPassPersonalizationFieldPhoneNumber"
  ],
  "description": "Enter your information to sign up and earn points.",
  "termsAndConditions": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n<a href='http://apple.com'>Tap Here for more Info</a> Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
};

function addPersonalization(p) {
  fs.writeFileSync(path.resolve(p, personalizationFilename), JSON.stringify(personalization));
}

/**
 * getRemotePassesAndAddLocal - Get all remote passes, and add to local db
 *
 * @return {type}  description
 */
function getRemotePassesAndAddLocal() {
  function func(doc) {
    if (doc.serialNumber) {
      emit(doc);
    }
  }
  //Get all docs
  localDb.query({
    map: func
  }, {
    include_docs: true,
    reduce: false
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
      doc.serialNumber = `0000-0000-0000-${index}`;
      doc.authenticationToken = chance.apple_token();

      doc.lastUpdated = Date.now();
      //  doc = new Pass(doc);
      _.extend(doc, {
        "foregroundColor": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(20, 89, 188)",
        "organizationName": "GE Digital",
        "description": "ID Card",
        "logoText": "GE Digital",
        "generic": {
          "headerFields": [],
          "primaryFields": [{
            "key": "employeeName",
            "label": "Senior Software Engineer",
            "value": "Jonnie Spratley"
          }],
          "secondaryFields": [{
            "key": "member",
            "label": "Member Since",
            "value": "2013"
          }, {
            "key": "team",
            "label": "Team",
            "value": "Predix Security"
          }],
          auxiliaryFields: [{
            "key": "sso",
            "label": "SSO",
            "value": "212400520"
          }],
          "backFields": [{
            "key": "phone",
            "label": "Phone #",
            "value": "555-555-5555"
          }, {
            "key": "email",
            "label": "Email",
            "value": "jonnie.spratley@ge.com"
          }, {
            "key": "team",
            "label": "Team",
            "value": "Predix Security"
          }, {
            "key": "expiryDate",
            "dateStyle": "PKDateStyleShort",
            "label": "Expiry Date",
            "value": "2013-12-31T00:00-23:59"
          }]
        },
        "locations": [{
          "latitude": 51.50506,
          "longitude": -0.0196,
          "relevantText": "Company Office"
        }]
      });
      assert(doc.passType, 'has docType');

      doc = new Pass(doc);

      localDb.put(doc).then(function(resp) {


        //TODO Create .raw
        passbook.createPassAssets({
          name: doc._id,
          type: doc.passType || doc.type || 'generic',
          output: path.resolve(__dirname, '../temp'),
          pass: doc
        }).then((out) => {

          doc.rawpassFilename = out;
          rawPasses.push(out);
          log.info('raw', out);

          //addPersonalization(out);

          assert(fs.existsSync(out), 'returns .raw filename');


          //TODO 1 - Create .pkpass
          passbook.createPkPass(out, certs.cert, certs.key, certs.passphrase).then((pkpass) => {
            log.info('pkpass', pkpass);
            doc.pkpassFilename = pkpass;
            doc.zipFilename = doc.rawpassFilename.replace('.raw', '.zip');


            assert(fs.existsSync(pkpass), 'return .pkpass filename');

            //TODO - 2 Save pass to server
            saveDocToPassbookServer(doc).then((res) => {
              log.info(res.id, res.rev);

              //  fs.removeSync(doc.rawpassFilename.replace('.raw', '.zip'));

              saveDocAttachment(doc, doc.pkpassFilename).then((d) => {

                log.info(d.id, d.rev);

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
    .on('change', function(info) {
      log.info('change', info);
    }).on('complete', function(info) {
      log.info('complete', info);
    }).on('uptodate', function(info) {
      // handle up-to-date
      log.info('uptodate', info);

    }).on('error', function(err) {
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



//getRemotePassesAndAddLocal();
//syncDbs();
//
//
function fixDocs() {
  var docs = [],
    doc = null;
  localDb.allDocs({
    include_docs: true
  }).then((resp) => {

    var _done = _.after(resp.rows.length, () => {
      localDb.bulkDocs(docs).then((res) => {
        console.log("Updated", res);
      });
    });

    _.each(resp.rows, (row) => {
      doc = row.doc;
      doc.passType = doc.type || 'generic';
      console.log('Fixed', doc);
      docs.push(doc);
      _done();
    });
  });
}

//fixDocs();
//getRemotePassesAndAddLocal();
/**
Device table. A device is identified by its device library identifier; it also has a push token.

Passes table. A pass is identified by pass type ID and serial number. This table includes a last-update tag (such as a time stamp) for when the pass was last updated, and typically includes whatever data you need to generate the actual pass.

Registrations table. A registration is a relationship between a device and a pass.

You need to be able to look up information in both directions:
  to find the passes that a given device has registered for, and
  to find the devices that have registered for a given pass.

Registration is a many-to-many relationship:
  a single device can register for updates to multiple passes, and
  a single pass can be registered by multiple devices.
*/
const PassbookServerViews = {
  devices: function(doc) {
    if (doc.docType === 'device') {
      emit(doc._id, doc.deviceLibraryIdentifier);
    }
  },
  passes: function(doc) {
    if (doc.docType === 'pass') {
      emit(doc._id, doc.passTypeIdentifier);
    }
  },
  logs: function(doc) {
    if (doc.docType === 'log') {
      emit(doc._id);
    }
  }
};

/*
localDb.query({
  map: PassbookServerViews.logs
}, {
  include_docs: true,
  reduce: false
}).then((resp) => {
  console.log(resp);
});

*/








// TODO: Create sample passes
//
function createSamplePasses(count){
  return new Promise((resolve, reject) =>{
    var docs = [],
        passes = [],
        i = 0,
        p;
    docs.length = count;

    var _done = _.after(docs.length , () =>{
      localDb.bulkDocs(passes).then(resolve, reject);
    });


    _.forEach(docs, (doc) =>{
      i++;
      p = new Pass( {
        type: 'generic',
        description: 'Pass ' + i,
        serialNumber: '0000-0000-0000-' + i,

        "foregroundColor": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(20, 89, 188)",
        "organizationName": "GE Digital",
        "description": "ID Card",
        "logoText": "GE Digital",
        "generic": {
          "headerFields": [],
          "primaryFields": [{
            "key": "employeeName",
            "label": "",
            "value": "Jonnie Spratley"
          }],
          "secondaryFields": [{
            "key": "member",
            "label": "Member Since",
            "value": "2013"
          }, {
            "key": "level",
            "label": "Level",
            "value": "Senior Software Engineer"
          }],
          auxiliaryFields: [
            {
            "key": "sso",
            "label": "SSO",
            "value": "212400520"
          },
          {
           "key": "team",
           "label": "Team",
           "value": "Predix Security"
         }
        ],
          "backFields": [{
            "key": "phone",
            "label": "Phone #",
            "value": "555-555-5555"
          }, {
            "key": "email",
            "label": "Email",
            "value": "jonnie.spratley@ge.com"
          }, {
            "key": "team",
            "label": "Team",
            "value": "Predix Security"
          }, {
            "key": "expiryDate",
            "dateStyle": "PKDateStyleShort",
            "label": "Expiry Date",
            "value": "2013-12-31T00:00-23:59"
          }]
        },
        "locations": [{
          "latitude": 51.50506,
          "longitude": -0.0196,
          "relevantText": "Company Office"
        }]
      });

      passes.push(p);
      console.log('Create doc', p);
      _done();

    });

  });
}

createSamplePasses(10).then((res) =>{
  console.log('Created', res);
});


var p = new Pass({
  serialNumber: '12345'
});
assert(p._id === 'pass-io-passbookmanager-test-12345', 'serial number matches')
assert(p.serialNumber === '12345', 'serial number matches')
