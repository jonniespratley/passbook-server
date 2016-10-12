'use strict';
const path = require('path');
const Chance = require('chance');
const chance = new Chance();
const _ = require('lodash');
const config = require(path.resolve(__dirname, '../../../config.js'));

module.exports = function(obj) {

  obj = obj || {
    docType: 'pass'
  };

  var type = obj.type || 'generic';
  var passType = {};

  if (obj.docType !== 'pass') {
    //  return obj;
  }

  try {
    if (type) {
      passType = require(path.resolve(__dirname, './templates/schemas/' + type + '.json'));
    }


  } catch (e) {
    console.log('Error loading schema');
  }

  var uuid = obj.serialNumber || chance.guid();
  var passTypeId = (obj.passTypeIdentifier || config.passTypeIdentifier).replace(/\./g, '-');
  var id = passTypeId + '-' + uuid;

  var pass = _.assign(this, {
      _id: id,
      docType: 'pass',
      type: type,
      // TODO: Standard keys - Information that is required for all passes.
      lastUpdated: _.now(),
      'logoText': 'Passbook Manager',
      'description': 'This is the default pass description.',
      formatVersion: 1,
      'organizationName': 'Passbook Manager',
      'passTypeIdentifier': obj.passTypeIdentifier || config.passTypeIdentifier,
      serialNumber: uuid,
      'teamIdentifier': obj.teamIdentifier || config.teamIdentifier,
      'authenticationToken': chance.apple_token(),
      'webServiceURL': obj.webServiceURL || config.webServiceURL,

      // TODO: expiration keys - Information about when a pass expires and whether it is still valid.
      /*expirationDate: null,
       */
      voided: false,

      //Apple pay keys
      /*	nfc: [
      		{
      			message: '',
      			encryptionPublicKey: ''
      		}
      	],*/
      'barcode': {
        'message': '123456789',
        'format': 'PKBarcodeFormatQR',
        'messageEncoding': 'iso-8859-1'
      },

      // TODO: Relevance keys
      beacons: [
        /* [{
        				major: null,
        				minor: null,
        				proximityUUID: '',
        				relevantText: ''
        			}]*/
      ],

      locations: [{
        'longitude': -122.00,
        'latitude': 37.00,
        //	altitude: null,
        relevantText: 'Nearby'
      }],

      maxDistance: 0,
      /*
			relevantDate: '',
		w3c date string*/

      //Visual apperance
      //barcodes: [],

      //Only for eventTicket and boardingPass
      //groupingIdentifier: '',

      labelColor: 'rgb(255, 255, 255)',
      foregroundColor: 'rgb(72, 72, 72)',
      backgroundColor: 'rgb(0, 0, 0)',
      suppressStripShine: false,

      //File locations
      filename: null,
      pkpassFilename: null,
      rawFilename: null
    },
    passType,
    obj
  );

  console.log('ID', pass._id);
  return this;
};
