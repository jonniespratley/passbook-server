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




const DEVICE_TOKEN = '21ae7caf052da0879f0a71cdd278f14fb64019905d929704fe4dbe0bb1cd4ef9';

var log = require('npmlog');
var apn = require('apn');
var apnOptions = {
  key : path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test-key.pem'),
  cert : path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test-cert.pem'),
  rejectUnauthorized: false,
  production: true,
  passphrase: 'test'
};
var apnProvider = new apn.Provider(apnOptions);
var note = new apn.Notification();
note.payload = {};

apnProvider.send(note, DEVICE_TOKEN).then( (result) => {
  log.info( 'sent', result);
  log.info( 'sent', result.failed);
}).catch((err) =>{
  log.error('error', err);
});
