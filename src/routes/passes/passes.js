'use strict';

const Pass = require('./pass');
const utils = require('../../utils');
const _ = require('lodash');
const async = require('async');
const logger = utils.getLogger('passes');
const log = require('npmlog');


module.exports = function(program) {

  class Passes {
    constructor(program) {
      this.db = program.get('db');
    }
    save(p) {
      return this.db.put(p);
    }
    create(p) {
      return this.db.post(p);
    }
    update(p) {
      return this.db.put(p);
    }
    get(p) {
      return this.db.get(p);
    }
    findById(id) {
      return this.db.get(id);
    }
    remove(p) {
      return this.db.remove(p._id, p._rev);
    }

    parseResponse(resp) {

    }

    find(params) {
      return this.db.find(params);
    }
    findOne(params) {
      return this.getPasses(params).then((resp) => {
        //log.info('findOne', _.filter(resp, params));
        return _(resp).filter(params).first();
      });
    }

    query(fun, params) {
      return this.db.query(fun, params);
    }

    _parseResponse(resp) {
        log.info('_parseResponse', resp);
        resp.map((row) => {
          if (row.doc) {
            return new Pass(row.doc);
          } else {
            return new Pass(row);
          }
        });
      }
      /**
       * Get all passes
       * @param params
       * @returns {*}
       */
    getPasses(params) {
      let _passes = [];
      params = _.assign({
        docType: 'pass'
      }, params);
      return new Promise((resolve, reject) => {
        log.info('getPasses', params);
        this.db.allDocs(params).then((resp) => {
          _passes = resp.rows.map((row) => {
            return new Pass(row.doc || row);
          });
          //log.info('getPasses', _passes);
          resolve(_passes);
        }).catch(reject);
      });
    }
    registerDeviceWithPass(device, pass) {

    }
    findPassesForDevice(device) {

    }
    findPassBySerial(serial) {
      logger('findPassBySerial', serial);
      return this.db.find({
        docType: 'pass',
        serialNumber: serial
      });
    }
    bulk(docs) {
      return this.db.bulkDocs(docs);
    }
  }

  return new Passes(program);
};
