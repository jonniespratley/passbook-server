'use strict';
const assert = require('assert');
const _ = require('lodash');

const uuid = require('node-uuid');
const log = require('npmlog');
/*
 * Methods
 * to find the passes that a given device has registered for,
 * to find the devices that have registered for a given pass.
 *
 *  Registration is a many-to-many relationship: a single device can register for updates to multiple passes,
 *  and a single pass can be registered by multiple devices.*/
module.exports = function (program) {
  const Passes = require('./passes')(program);
  const Pass = require('./pass');

  var db = program.db;
  var logger = program.getLogger('controller:passes');

  class PassesController {
    constructor(){
      
    }
    get_passes(req, res) {
      var self = this;
      var auth = req.get('Authorization');
      var pass_type_id = req.params.pass_type_id;
      var device_id = req.params.device_id;
      var serial_number = req.params.serial_number;
      var lastUpdated = req.query.updatedSince;

      //assert.ok(pass_type_id, 'has pass type id');

      logger('Handling pass delivery request...');
      logger('url=', req.url);
      logger('params=', req.params);
      logger('Authorization=', auth);
      logger('pass_type_id=', pass_type_id);
      logger('serial_number=', serial_number);
      logger('device_id=', device_id);

      if (!auth) {
        logger('get_passes:unauthorized');
        return res.status(401).json({
          error: 'Unauthorized'
        });

      } else {
        Passes.findOne({
          docType: 'pass',
          passTypeIdentifier: pass_type_id,
          serialNumber: serial_number
        }).then(function (resp) {
          let pass = new Pass(resp);
          logger('get_passes:success', pass._id);
          if (lastUpdated > pass.lastUpdated) {
            logger('last-updated', lastUpdated, pass.lastUpdated);
            res.status(204).json(pass);
          } else {
            res.status(200).json(pass);
          }
        }).catch(function (err) {
          logger('get_passes:error', err);
          res.status(404).json(err);
        });
      }
    }
  }

  return new PassesController();
};
