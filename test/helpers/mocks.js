'use strict';
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const chance = new require('chance')();
const PouchDBAdapter = require(path.resolve(__dirname, '../../src/db-pouchdb.js'));
const Main = require(path.resolve(__dirname, '../../src/main.js'));
const CouchDB = require(path.resolve(__dirname, '../../src/db-couchdb.js'));
const Configuration = require(path.resolve(__dirname, '../../src/configuration.js'))
  //var config = require(path.resolve(__dirname, '../../config.js'));
const Pass = require(path.resolve(__dirname, '../../src/routes/passes/pass.js'));
const Passes = require(path.resolve(__dirname, '../../src/routes/passes/passes.js'));
const Device = require(path.resolve(__dirname, '../../src/routes/devices/device.js'));

var config = require('../test-config.js');
var _program;



var _instance = null;
exports.main = function(){
  if(_instance){
    return _instance;
  } else {
    _instance = new Main(config);
  }
  return _instance;
};
exports.program = function(adapterType) {

  let _config = {
    config: config
  };
  if(_program){
    return _program;
  } else {
    _program = require(path.resolve(__dirname, '../../src/program.js'))(config);
    exports.config = config = _program.get('config');
    exports.mockIdentifer = {
      teamIdentifier: process.env.TEAM_IDENTIFIER || _program.config.get('teamIdentifier'),
      passTypeIdentifier: process.env.PASS_TYPE_IDENTIFIER || _program.config.get('passTypeIdentifier'),
      p12: config.get('passTypeIdentifierP12'),
      passphrase: 'fred'
    };
  }


  var log = _program.getLogger('mocks');
  log('mocks.js', config);
  log('guid', chance.guid());

  exports.log = log;
  return _program;
};




exports.Pass = Pass;
exports.Passes = Passes;
exports.Device = Device;

exports.mockPasses = [

  new Pass({
    //_id: 'mock-generic',
    description: 'Example Generic',
    serialNumber: 'mock-generic',
    type: 'generic'
  }),

  new Pass({
    serialNumber: 'mock-boardingpass',
    description: 'Example Boarding Pass',
    type: 'boardingPass'
  }),

  new Pass({
    serialNumber: 'mock-coupon',
    description: 'Example Coupon',
    type: 'coupon'
  }),

  new Pass({
    serialNumber: 'mock-eventticket',
    description: 'Example Event Ticket',
    type: 'eventTicket'
  }),

  new Pass({
    serialNumber: 'mock-storecard',
    description: 'Example Store Card',
    type: 'storeCard'
  })
];


exports.mockPass = exports.mockPasses[0];

///api/v1/v1/devices/a53ae770f6bd12d04c572e653888c6c6/registrations/pass.passbookmanager.io/25df3392-f37d-48c3-a0a1-20e9edc95f8b
exports.mockDevice = new Device({
  //"_id": "device-123456789",
  pushToken: '123456',
  //  "deviceLibraryIdentifier": "0000-0000-0000-0000-" + Date.now(),
  "deviceLibraryIdentifier": "b4ed43cfeb2a5563454069a0eb0f760b",
  "authorization": exports.mockPass.authenticationToken
});

exports.getMockPasses = function(count){
  var _out = [];
  for (var i = 0; i < count; i++) {
    _out.push(new Pass( {
      type: 'generic',
      description: 'Pass ' + i,
      serialNumber: chance.guid(),
      "foregroundColor": "rgb(20, 89, 108)",
      "backgroundColor": "rgb(20, 89, 188)",
      "organizationName": "GE Digital",
      "description": "ID Card",
      "logoText": "GE Digital"
    }));
  }
  return _out;
};

function createSamplePasses(count){
  return new Promise((resolve, reject) =>{
    var docs = [],
        passes = [],
        i = 0,
        p;
    docs.length = count;

    var _done = _.after(docs.length , () =>{
      resolve(passes);
    });

    _.forEach(docs, (doc) =>{
      i++;
      p = new Pass( {
        type: 'generic',
        description: 'Pass ' + i,
        serialNumber: chance.guid(),
        "foregroundColor": "rgb(20, 89, 108)",
        "backgroundColor": "rgb(20, 89, 188)",
        "organizationName": "GE Digital",
        "description": "ID Card",
        "logoText": "GE Digital"
      });

      _program.db.get(p._id).then((existingDoc) =>{
        p._rev = existingDoc._rev;
        _program.db.put(p).then((resp)=>{
        log('create resp', resp);
          p._rev = resp.rev;
          p._id = resp.id;
          passes.push(p);
          _done();
        }).catch((err) =>{
          console.log('error', err);
          _done();
        });
      }).catch((err) =>{
        _program.db.put(p).then((resp)=>{
          log('create resp', resp);
          p._rev = resp.rev;
          p._id = resp.id;
          passes.push(p);
          _done();
        }).catch((err) =>{
          log('error', err);
          _done();
        });
      });
    });
  });
}
exports.createSamplePasses = createSamplePasses;
