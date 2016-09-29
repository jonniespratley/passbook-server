'use strict';
var fs = require('fs-extra');
var path = require('path');

const PouchDBAdapter = require(path.resolve(__dirname, '../../src/db-pouchdb.js'));
const CouchDB = require(path.resolve(__dirname, '../../src/db-couchdb.js'));
const Configuration = require(path.resolve(__dirname, '../../src/configuration.js'))
  //var config = require(path.resolve(__dirname, '../../config.js'));
var config = new Configuration(require(path.resolve(__dirname, '../test-config.js')));


const dbPath = path.resolve(__dirname, '../temp/', config.get('database.name'));



exports.mockIdentifer = {
  teamIdentifier: process.env.TEAM_IDENTIFIER || config.get('teamIdentifier'),
  passTypeIdentifier: process.env.PASS_TYPE_IDENTIFIER || config.get('passTypeIdentifier'),
  p12: config.get('passTypeIdentifierP12'),
  passphrase: 'fred'
};


exports.config = config;

exports.program = function(adapterType) {
  fs.ensureDirSync(dbPath);
  let _config = {
    config: config
  };
  switch (adapterType) {
    case 'filedb':
      _config.dataPath = dbPath;
      break;
    case 'pouchdb':
      _config.adapter = new PouchDBAdapter(dbPath);
      break;
    case 'couchdb':
      _config.adapter = new CouchDB(config.database.url);
      break;
    default:
      _config.dataPath = dbPath;
      break;

  }

  //var adapter = new CouchDB('http://localhost:4987/passbook-server');
  //  var adapter = new PouchDBAdapter(dbPath);
  var _program = require(path.resolve(__dirname, '../../src/program.js'))(_config);
  //adapter.bulkDocs(exports.mockPasses);
  return _program;
};


var Pass = require(path.resolve(__dirname, '../../src/routes/passes/pass.js'));
var Passes = require(path.resolve(__dirname, '../../src/routes/passes/passes.js'));
var Device = require(path.resolve(__dirname, '../../src/routes/devices/device.js'));

exports.Pass = Pass;
exports.Passes = Passes;
exports.Device = Device;

exports.mockPasses = [

  new Pass({
    //_id: 'mock-generic',
    description: 'Example Generic',
    //serialNumber: '0123456789876543210',
    authenticationToken: '0123456789876543210',

    type: 'generic'
  }),

  new Pass({
    //serialNumber: 'mock-boardingpass',
    description: 'Example Boarding Pass',
    type: 'boardingPass'
  }),

  new Pass({
    // serialNumber: 'mock-coupon',
    description: 'Example Coupon',
    type: 'coupon'
  }),

  new Pass({
    //serialNumber: 'mock-eventticket',
    description: 'Example Event Ticket',
    type: 'eventTicket'
  }),

  new Pass({
    //serialNumber: 'mock-storecard',
    description: 'Example Store Card',
    type: 'storeCard'
  })
];


exports.mockPass = exports.mockPasses[0];

///api/v1/v1/devices/a53ae770f6bd12d04c572e653888c6c6/registrations/pass.passbookmanager.io/25df3392-f37d-48c3-a0a1-20e9edc95f8b
exports.mockDevice = new Device({
  //"_id": "device-123456789",
  pushToken: '123456',
  "deviceLibraryIdentifier": "0000-0000-0000-0000-" + Date.now(),
  "authorization": exports.mockPass.authenticationToken
});
