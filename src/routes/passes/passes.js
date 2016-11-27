'use strict';

const Pass = require('./pass');
const utils = require('../../utils');
const _ = require('lodash');
const async = require('async');
const logger = utils.getLogger('passes');
const log = require('npmlog');
const assert = require('assert');


module.exports = function(program) {

  class Passes {
    constructor(program) {
      this.db = program.get('db');
    }
    save(p) {
      p = new Pass(p);
      assert(p._id, 'pass must have _id');
      return this.get(p._id).then((resp) => {
        log.info('Found existing doc', resp);
        p._id = resp._id;
        p._rev = resp._rev;
        log.info('save', resp);
        return this.db.put(p);
      }).catch((err) => {
        log.error('save', err);
        return this.db.put(p);
      });
    }
    create(p) {
      return this.db.post(new Pass(p));
    }
    update(p) {
      return this.db.put(new Pass(p));
    }
    get(id) {
      log.info('get', id);
      assert(id, 'pass must have _id');
      return this.db.get(id);
    }
    findById(id) {
      assert(id, 'pass must have _id');
      log.info('findById', id);
      return this.db.get(id);
    }
    remove(p) {
      log.info('remove', p);
      assert(p._id, 'pass must have _id');
      return this.db.get(p._id).then((resp) => {
        return this.db.remove(resp._id, resp._rev).catch((err) => {
          log.error('remove', err);
          return err;
        });
      }).catch((err) => {
        log.error('remove', err);
        return err;
      });
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
        return resp.map((row) => {
          return (row.doc || row);
        });
      }
      /**
       * Get all passes
       * @param params
       * @returns {*}
       */
    getPasses(params) {
      let _passes = [];
      params = _.extend({
        docType: 'pass'
      }, params);
      return new Promise((resolve, reject) => {
        log.info('getPasses', params);
        this.db.allDocs({
          include_docs: true
        }).then((resp) => {
          _passes = resp.rows.map((row) => {
            return row.doc;
          });
          _passes = _passes.filter((p) => {
            return p.docType === 'pass';
          })

          //  log.info('getPasses', _passes);
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

      function map(doc) {
        if (doc.docType === 'pass' && doc.serialNumber === serial) {
          console.log('found doc', doc);
          emit(doc.serialNumber);
        }
      }
      return this.db.query({
        map: map
      }, {
        reduce: false,
        include_docs: true
      });
    }
    bulk(docs) {
      return this.db.bulkDocs(docs);
    }
  }

  return new Passes(program);
};
