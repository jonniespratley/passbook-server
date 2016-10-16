'use strict';
const path = require('path');
/*
var apns = require('apns'), notification, options, connection;

options = {
   keyFile : path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test-key.pem'),
   certFile : path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test-cert.pem'),
   debug : true,
   passphrase: 'fred',
   errorCallback: function(err){
     console.log('errorCallback', err);
   }
};


connection = new apns.Connection(options);

notification = new apns.Notification();
notification.payload = {};
notification.device = new apns.Device(DEVICE_TOKEN);

//connection.sendNotification(notification);
*/


const config = require('../config');
const DEVICE_TOKEN = '21ae7caf052da0879f0a71cdd278f14fb64019905d929704fe4dbe0bb1cd4ef9';
const PouchDB = require('pouchdb');
const db = new PouchDB(config.database.url);
const log = require('npmlog');
const apn = require('apn');
const apnOptions = {
  key: path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test-key.pem'),
  cert: path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test-cert.pem'),
  rejectUnauthorized: false,
  production: true,
  passphrase: 'test'
};
const apnProvider = new apn.Provider(apnOptions);


function sendPush(token) {
  var note = new apn.Notification();
  note.payload = {};
  apnProvider.send(note, token).then((result) => {
    console.log('sent', result);
  });
}

function map(doc, emit) {
  if (doc.docType === 'device') {
    emit(doc._id, 1);
  }
}

db.query(map, {
  reduce: false,
  include_docs: true
}).then((resp) => {
  console.log(resp);
  for (var i = 0; i < resp.rows.length; i++) {
    let doc = resp.rows[i].doc;
    console.log(doc);
  }
});

/**
basic recursive function


*/
function recursive(nodes) {
  var node;
  if (nodes) {
    for (var i = 0; i < nodes.length; i++) {
      node = nodes[i];
      console.log('found', node.label);
      recursive(node.children);
    }
  } else {
    return;
  }
}

var nodes = [{
  label: 'root',
  children: [{
    label: 'grand parent',
    children: [{
      label: 'parent',
      children: [{
        label: 'child 1'
      }, {
        label: 'child 2'
      }, {
        label: 'child 3'
      }]
    }]
  }]
}];

recursive(nodes);
