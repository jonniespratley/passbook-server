'use strict';
const logger = require('debug')('passbook-server:db');

const _ = require('lodash');
const assert = require('assert');
const Store = require('jfs');
const log = require('npmlog');

let instance = null;
let db = null;
/**
 * @class Db
 * @example
 *  const db = new DB('test-db');
 * db.put({name: 'test'});
 *
 * Simple file store adapter
 */
class Db {
  /**
   * @param {String} name The path to the data store.
   * @param {String} options Options to apply
   * @constructor
   */
  constructor(name, options) {
      options = _.extend({
        saveId: '_id',
        //type: 'single'
        pretty: true
      }, options);

      db = new Store(name, options);
      this.db = db;
      instance = this;
      return this;
    }
    /**
     * Find document in store.
     * @param {Object} params Parameters to query with
     * @returns {*}
     */
  findBy(params) {
    logger('findBy', params);
    return this.find(params).then(function(resp) {
      logger('findBy', resp);
      return _(resp).find(params);
    });
  }
  /**
   * Find first document in store.
   * @param {Object} params Parameters to query with
   * @returns {*}
   */
  findOne(params) {
    logger('findBy', params);
    return this.find(params).then(function(resp) {
      logger('findBy', resp);
      return _(resp).filter(params).first();
    });
  }
    /**
     * Query documents in store.
     * @param {Object} params Parameters to query with
     * @returns {Promise}
     */
  find(params) {
      logger('find', params);
      return new Promise((resolve, reject) => {
        let _docs = [];
        this.allDocs(params).then((resp) => {
          _docs = resp.rows.map((row) => {
            return row.doc;
          });

          resolve(_.filter(_docs, params));
        }).catch(reject);
      });
    }

    /**
     * Fetch all docs from store.
     * @param {Object} params Parameters to query with
     * @returns {Promise}
     */
  allDocs(params) {
      return new Promise(function(resolve, reject) {
        let _docs = [],
          _obj;
        logger('allDocs', params);
        _.defer(function() {
          db.all(function(err, objs) {
            if (err) {
              reject(err);
            }
            for (_obj in objs) {
              _docs.push({
                id: objs[_obj]._id,
                rev: objs[_obj]._rev,
                doc: objs[_obj]
              });
            }
            resolve({
              rows: _docs
            });
          });
        });
      });
    }
    /**
     * @description Update a document in store.
     * @example
        db.put({
         _id: 'test-file',
         name: 'test',
         docType: 'file'
       }).then(function(resp) {
         assert(resp);
         done();
       }).catch(done);
     * @param {Object} doc Document object to save
     * @param {String} [id] The id of the document or if doc._id it uses that
     * @returns {Promise} Promise that resolves or rejects
     */
  put(doc, id) {
      return new Promise(function(resolve, reject) {
        assert(doc._id, 'document must have _id');
        logger('put', doc._id);
        doc._rev = '0-0000';
        db.save(doc._id || id, doc, function(err) {
          if (err) {
            logger('put.error', err);
            reject(err);
          } else {
            logger('put.success', doc._id);
            resolve({
              ok: true,
              id: doc._id,
              rev: doc._rev
            });
          }
        });
      });
    }
    /**
     * Create document in store.
     * @param {Object} doc Document object to store
     * @param {String} [prefix] Prefix to prepend to generated id
     * @returns {Promise}
     */
  post(doc, prefix) {
      return new Promise((resolve, reject) => {
        doc._id = this.getUUID(prefix);
        doc._rev = 0;
        doc._rev++;
        logger('post', doc);
        _.defer(() => {
          db.save(doc, (err) => {
            if (err) {
              logger('post.error', err);
              reject(err);
            } else {
              doc._id = doc._id;
              doc._rev = doc._rev;
              logger('post.success', doc._id);
              resolve({
                ok: true,
                id: doc._id,
                rev: doc._rev
              });
            }
          });
        });
      });
    }
    /**
     * Remove document from store by id
     * @param id
     * @returns {Promise}
     */
  remove(id, rev) {
      return new Promise(function(resolve, reject) {
        id = id._id || id;
        logger('remove', id);
        try {
          db.delete(id);
          resolve({
            ok: true,
            rev: rev,
            id: id
          });
        } catch (e) {
          //logger('remove.success', id);
          log.error('remove', e);
          reject(e);
        }
      });
    }
    /**
     * Get document in store by id.
     * @param id
     * @returns {Promise}
     */
  get(id) {
      return new Promise(function(resolve, reject) {
        logger('get', id);
        _.defer(function() {
          db.get(id, function(err, obj) {
            if (err) {
              logger('get.error', err);
              reject(err);
            } else {
              logger('get.success', id);
              resolve(obj);
            }
          });
        });
      });
    }
    /**
     * Save array of documents in store.
     * @param {Array} docs Array of documents
     * @returns {Promise}
     */
  bulkDocs(docs) {
      let self = this;
      return new Promise(function(resolve, reject) {
        logger('saveAll', docs.length);
        let saves = [];
        let _done = _.after(docs.length, function() {
          logger('saveAll.success');
          resolve(saves);
        });

        _.forEach(docs, function(doc) {
          doc._id = doc._id || self.getUUID();
          doc._rev = doc._rev || 0;
          self.put(doc).then(function(resp) {
            saves.push(resp);
            _done();
          }).catch(function(err) {
            _done(err);
            reject(err);

          });
        });
      });
    }
  /**
   * Save array of documents in store.
   * @param {Array} docs Array of documents
   * @returns {Promise}
   */
  saveAll(docs) {
    return this.bulkDocs(docs);
  }

  getUUID(prefix) {
    let _prefix = prefix || 'doc';
    let uuid = require('node-uuid').v4();
    return `${_prefix}-${uuid}`;
  }

  putAttachment() {
    log.error('putAttachment', 'not implemented');
  }
  getAttachment() {
    log.error('getAttachment', 'not implemented');
  }
  removeAttachment() {
    log.error('removeAttachment', 'not implemented');
  }
  query(fun, options) {
    return this.allDocs(options).map(fun);
  }

  static getInstance() {
    if (instance) {
      return instance;
    } else {
      return new Db();
    }
  }
}


module.exports = Db;
