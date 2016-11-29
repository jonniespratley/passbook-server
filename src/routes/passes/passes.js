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
      this.logger = program.getLogger('Passes');
    }

    /**
     * save - save a pass to the data store
     *
     * @param  {type} p description
     * @return {type}   description
     */
    save(p) {
      p = new Pass(p);
      assert(p._id, 'pass must have _id');
      return this.get(p._id).then((resp) => {
        this.logger('Found existing doc', resp);
        p._id = resp._id;
        p._rev = resp._rev;
        this.logger('save', resp);
        return this.db.put(p);
      }).catch((err) => {
        this.logger('save', err);
        return this.db.put(p);
      });
    }

    /**
     * create - Create a new pass
     *
     * @param  {type} p description
     * @return {type}   description
     */
    create(p) {
      return this.db.post(new Pass(p));
    }

    /**
     * update - Update existing pass
     *
     * @param  {type} p description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    update(p) {
      return this.db.put(new Pass(p));
    }

    /**
     * get - Get pass by id
     *
     * @param  {type} id description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    get(id) {
      this.logger('get', id);
      assert(id, 'pass must have _id');
      return this.db.get(id);
    }

    /**
     * findById - Find a pass by id
     *
     * @param  {type} id description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    findById(id) {
      assert(id, 'pass must have _id');
      this.logger('findById', id);
      return this.db.get(id);
    }

    /**
     * remove - Remove a pass from the data store
     *
     * @param  {type} p description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    remove(p) {
      assert(p._id, 'pass must have _id');
      this.logger('remove', p._id);
      return this.db.get(p._id).then((resp) => {
        return this.db.remove(resp._id, resp._rev).catch((err) => {
          this.logger('remove', err);
          return err;
        });
      }).catch((err) => {
        this.logger('remove', err);
        return err;
      });
    }

    parseResponse(resp) {

    }

    find(params) {
      return this.db.find(params);
    }


    /**
     * findOne - Find first pass that matches params
     *
     * @param  {type} params description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    findOne(params) {
      return this.getPasses(params).then((resp) => {
        //log.info('findOne', _.filter(resp, params));
        return _(resp).filter(params).first();
      });
    }


    /**
     * query - Query the data store
     *
     * @param  {type} fun    description
     * @param  {type} params description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    query(fun, params) {
      return this.db.query(fun, params);
    }


    /**
     * _parseResponse - Parse response from store
     *
     * @param  {type} resp description
     * @return {type}      description
     */
    _parseResponse(resp) {
        log.info('_parseResponse', resp);
        return resp.map((row) => {
          return (row.doc || row);
        });
      }


    /**
     * getPasses - Get all passes from store
     *
     * @param  {type} params description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    getPasses(params) {
      let _passes = [];
      params = _.extend({
        docType: 'pass'
      }, params);
      return new Promise((resolve, reject) => {
        this.logger('getPasses', params);
        this.db.allDocs({
          include_docs: true
        }).then((resp) => {
          _passes = resp.rows.map((row) => {
            return row.doc;
          });
          _passes = _passes.filter((p) => {
            return p.docType === 'pass';
          })
          resolve(_passes);
        }).catch(reject);
      });
    }

    registerDeviceWithPass(device, pass) {

    }

    findPassesForDevice(device) {

    }

    /**
     * findPassBySerial - Find all passes by serial number
     *
     * @param  {type} serial description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    findPassBySerial(serial) {
      this.logger('findPassBySerial', serial);
      function map(doc, emit) {
        if (doc.docType === 'pass' && doc.serialNumber === serial) {
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


    /**
     * bulk - Bulk create/update/delete on data store
     *
     * @param  {type} docs description
     * @return {Promise}   Promise that resolves/rejects on success/failure
     */
    bulk(docs) {
      return this.db.bulkDocs(docs);
    }
  }

  return new Passes(program);
};
