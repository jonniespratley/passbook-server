'use strict';
const logger = require('debug')('passbook-server:db');
var instance = null;
const _ = require('lodash');
const assert = require('assert');
const Store = require('jfs');



var db = null;
/**
 * @class Db
 * Simple file store adapter
 */
class Db {
    /**
     * @param {String} name The path to the data store.
     * @constructor
     */
    constructor(name, options){
        options = _.extend({
            saveId: '_id',
            //	type: 'single',
            pretty: true
        }, options)
        db = new Store(name, options);
        this.db = db;

        this.saveSync = db.saveSync;
        this.allSync = db.allSync;
        this.getSync = db.getSync;

        //this.bulkDocs = _ds.saveAll;
        //this.findOne = _ds.findBy;

        instance = this;
    }
    /**
     * Find first document in store.
     * @param {Object} params Parameters to query with
     * @returns {*}
     */
    findBy(params) {
        logger('findBy', params);
        return this.allDocs(params).then(function(resp) {
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
                _out = _.filter(resp.rows, params);

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
                        _docs.push(objs[_obj]);
                    }
                    if (params) {
                        _docs = _.filter(_docs, params);
                    }
                    resolve({
                        rows: _docs
                    });
                });
            });
        });
    }
    /**
     * Update doc in store.
     * @param {Object} doc Document object to store
     * @param {String} id The id of the document
     * @returns {Promise}
     */
    put(doc, id) {
        assert(doc._id, 'document must have _id');
        return new Promise(function(resolve, reject) {
            logger('put', doc._id);
            _.defer(function() {
                db.save(doc._id || id, doc, function(err) {
                    if (err) {
                        logger('put.error', err);
                        reject(err);
                    } else {
                        logger('put.success', doc._id);
                        resolve(doc);
                    }

                });
            });
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
        return new Promise(function(resolve, reject) {

            logger('post', doc);
            _.defer(function() {
                db.save(doc, function(err) {
                    if (err) {
                        logger('post.error', err);
                        reject(err);
                    } else {
                        doc.id = doc._id;
                        logger('post.success', doc._id);
                        resolve(doc);
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
    remove(id) {
        return new Promise(function(resolve, reject) {
            logger('remove', id);
            _.defer(function() {
                db.delete(id, function(err) {
                    if (err) {
                        logger('remove.error', err);
                        reject(err);
                    } else {
                        logger('remove.success', id);
                        resolve(id);
                    }
                });
            });
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
    saveAll(docs) {
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
                self.put(doc).then(function(resp) {
                    saves.push(resp);
                    _done();
                }).catch(function(err) {
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
    bulkDocs(docs){
        return this.saveAll(docs);
    }
    findOne(params){
        return this.findBy(params);
    }
    getUUID(prefix){
        let _prefix = prefix || 'doc';
        let uuid = require('node-uuid').v4();
        return `${_prefix}-${uuid}`;
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
