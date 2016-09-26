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
module.exports = function(program) {
  const Passes = require('./passes')(program);
  const Pass = require('./pass');

  var db = program.db;
  var logger = program.getLogger('controller:passes');

  /*
   * To handle the device registration, do the following:

   Verify that the authentication token is correct. If it doesn’t match, immediately return the HTTP status 401 Unauthorized and disregard the request.
   Store the mapping between the device library identifier and the push token in the devices table.
   Store the mapping between the pass (by pass type identifier and serial number) and the device library identifier in the registrations table.
   */
  var PassesController = {


    get_passes: function(req, res) {
      var self = this;
      var auth = req.get('Authorization');
      var pass_type_id = req.params.pass_type_id;
      var device_id = req.params.device_id;
      var serial_number = req.params.serial_number;
      var lastUpdated = req.query.updatedSince;

      //assert.ok(pass_type_id, 'has pass type id');

      logger('Handling pass delivery request...');
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
          passTypeIdentifier: pass_type_id,
          serialNumber: serial_number
        }).then(function(resp) {
          let pass = resp;
          logger('get_passes:success', pass._id);
          if (lastUpdated > pass.lastUpdated) {
            logger('last-updated', lastUpdated, pass.lastUpdated);
            res.status(204).json({});
          } else {
            res.status(200).json(pass);
          }
        }).catch(function(err) {
          logger('get_passes:error', err);
          res.status(404).json(err);
        });
      }
    },

    post_pass: function(req, res) {
      var p = new Pass(req.body);
      logger('post_pass', p._id);
      Passes.save(p).then(function(resp) {
        res.status(201).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });

    },
    put_pass: function(req, res) {
      var p = new Pass(req.body);
      var id = req.params.id
        //p._id = id;
      logger('put_pass', id);
      if (!id) {
        return res.status(400).json({
          error_message: 'Must provide an ID!'
        });
      }
      Passes.save(p).then(function(resp) {
        logger('put_pass', resp._id);
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    },
    get_all_passes: function(req, res) {
      //req.query.docType = 'pass';

      Passes.getPasses(req.query).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    },
    get_pass: function(req, res) {
      var id = req.params.id
      logger('get_pass', id);
      if (!id) {
        return res.status(400).json({
          error_message: 'Must provide an ID!'
        });
      }

      Passes.findById(id).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });

    },
    delete_pass: function(req, res) {
      var id = req.params.id;
      logger('delete_pass', id);
      if (!id) {
        return res.status(400).json({
          error_message: 'Must provide an ID!'
        });
      }
      Passes.remove(id).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    },
    get_find_pass: function(req, res) {
      var params = req.query;
      logger('get_find_pass', params);
      Passes.find(params).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    }
  };

  return PassesController;
};
