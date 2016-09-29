'use strict';
const logger = require('debug')('passbook-server:db');
var instance = null;
const _ = require('lodash');
const assert = require('assert');
const PouchDB = require('pouchdb');
const log = require('npmlog');
//PouchDB.debug.enable('*');
var db = null;
/**
 * @class PouchDBAdapter
 * Simple PouchDB adapter
 */
class PouchDBAdapter {
  /**
   * @param {String} name The path to the data store.
   * @constructor
   */
  constructor(name, options) {
    this.options = Object.assign(options || {});
    log.info('PouchDBAdapter', name);

    this.db = this.getAdapter(name, this.options);
    instance = this;
  }

  static getInstance() {
    if (instance) {
      return instance;
    } else {
      return new PouchDBAdapter('data');
    }
  }

  getAdapter(name, options) {
      log.info('getAdapter', name, options);
      if (!db) {
        db = new PouchDB(name, options);
      }
      return db;
    }
    /**
     * Find first document in store.
     * @param {Object} params Parameters to query with
     * @returns {*}
     */
  findBy(params) {
      logger('findBy', params);
      return this.allDocs(params).then((resp) => {
        return _(resp.rows).first();
      });
    }
    /**
     * Query documents in store.
     * @param {Object} params Parameters to query with
     * @returns {Promise}
     */
  find(params) {
      let self = this;
      logger('find', params);
      return new Promise(function(resolve, reject) {
        let _out, _docs = [];

        self.allDocs(params).then(function(resp) {
          _docs = _.map(resp.rows, function(row) {
            return row.doc;
          });
          if (params) {
            _out = _.filter(_docs, params);
          } else {
            _out = _docs;
          }


          if (_out && _out.length > 0) {
            logger('find.success', _out.length);
            resolve(_out);
          } else {
            /*TODO - Never reject, just return empty */
            reject({
              error: 'No match found',
              params: params
            });
          }

        });
      });
    }
    /**
     * Fetch all docs from store.
     * @param {Object} params Parameters to query with
     * @returns {Promise}
     */
  allDocs(params) {
      return new Promise((resolve, reject) => {
        let _docs = [],
          _obj;
        logger('allDocs', params);
        db.allDocs({
          include_docs: true
        }, (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res);
        });
      });
    }
    /**
     * Update doc in store.
     * @param {Object} doc Document object to store
     * @param {String} id The id of the document
     * @returns {Promise}
     */
  put(doc) {
      assert(doc._id, 'document must have _id');
      //assert(doc._rev, 'document must have _rev');
      return new Promise((resolve, reject) => {
        logger('put', doc._id);
        this.db.put(doc).then((res) => {
          doc._id = doc.id;
          doc._rev = doc.rev;
          logger('put.success', res);
          resolve(res);
        }).catch(reject);
      });
    }
    /**
     * Create doc in store.
     * @param {Object} doc Document object to store
     * @param {String} prefix Prefix to prepend to generated id
     * @returns {Promise}
     */
  post(doc, prefix) {
      doc._id = this.getUUID(prefix);
      return new Promise((resolve, reject) => {
        log.info('post', doc);
        this.db.post(doc).then((resp) => {
          log.info('post.success', resp);
          doc._id = resp.id;
          doc._rev = resp.rev;
          resolve(resp);
        }).catch((err) => {
          logger('post.error', err);
          reject(err);
        })

      });
    }
    /**
     * Remove document from store by id
     * @param id
     * @returns {Promise}
     */
  remove(doc) {
      return new Promise((resolve, reject) => {
        logger('remove', doc);
        this.db.remove(doc).then(resolve, reject);
      });
      return db.remove(doc).then(resolve, reject);
    }
    /**
     * Get document in store by id.
     * @param id
     * @returns {Promise}
     */
  get(id) {
      return new Promise((resolve, reject) => {
        logger('get', id);
        this.db.get(id).then((res) => {
          logger('get.success', res);
          resolve(res);
        }).catch((err) => {
          logger('get.error', err);
          reject(err);
        });
      });
    }
    /**
     * Save array of documents in store.
     * @param {Array} docs Array of documents
     * @returns {Promise}
     */
  saveAll(docs) {
      let self = this;
      return new Promise((resolve, reject) => {
        logger('saveAll', docs.length);
        let saves = [];
        let _done = _.after(docs.length, () => {
          logger('saveAll.success');
          resolve(saves);
        });

        _.forEach(docs, (doc) => {
          doc._id = doc._id || self.getUUID();
          self.put(doc).then((resp) => {
            saves.push(resp);
            _done();
          }).catch((err) => {
            _done(err);
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
    return this.db.bulkDocs(docs);
  }

  putAttachment(id, attachmentId, rev, attachment, contentType) {
    log.info('putAttachment', id, attachmentId);
    return new Promise((resolve, reject) => {
      this.db.putAttachment(id, attachmentId, rev, attachment, contentType, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  getAttachment(id, attachmentId) {
    log.info('getAttachment', id, attachmentId);
    return new Promise((resolve, reject) => {
      this.db.getAttachment(id, attachmentId, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  removeAttachment(id, attachmentId, rev) {
    return new Promise((resolve, reject) => {
      this.db.removeAttachment(id, attachmentId, rev, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  query(fun, options) {
    return this.db.query(fun, options);
  }

  findOne(params) {
    return this.find(params).then((resp) => {
      //log.info('findOne', _.filter(resp, params));
      return _(resp).filter(params).first();
    });
  }

  getUUID(prefix) {
    let _prefix = prefix || 'doc';
    let uuid = require('node-uuid').v4();
    return `${_prefix}-${uuid}`;
  }
}


module.exports = PouchDBAdapter;
