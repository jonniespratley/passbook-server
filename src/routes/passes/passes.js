'use strict';

const Pass = require('./pass');
const utils = require('../../utils');
const _ = require('lodash');
const async = require('async');
const logger = utils.getLogger('passes');
const log = require('npmlog');

var db;



module.exports = function(program){
    class Passes {
        constructor(program) {
            log.info('Passes required');

            db = program.db;
            this.db = db;

        }
        save(p) {
            return new Promise((resolve, reject) => {
                if(!p._id){
                    this.create(p).then(resolve, reject);
                } else {
                    this.update(p).then(resolve, reject);
                }
            });
        }
        create(p) {
            return new Promise((resolve, reject) => {
                this.db.post(p).then((resp) => {
                    resolve(resp);
                }).catch(reject);
            });
        }
        update(p) {
            return new Promise((resolve, reject) => {
                this.db.put(p).then((resp) => {
                    resolve(resp);
                }).catch(reject);
            });
        }
        get(p) {
            return this.db.get(p);
        }
        remove(p) {
            return new Promise((resolve, reject) => {
                this.db.remove(p).then((resp) => {
                    resolve(resp);
                }).catch(reject);
            });
        }

        parseResponse(resp){

        }

        find(params){
            return this.getPasses(params);
        }
        findOne(params){
          return this.db.findOne(params);
        }

        query(fun, params) {
          return this.db.query(fun, params);
        }

        _parseResponse(resp) {
            log.info('_parseResponse', resp._id);
                return resp.map((row) => {
                    if(row.doc){
                        return row.doc;
                    } else {
                        return row;
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
                this.db.find({
                    docType: 'pass'
                }).then(this._parseResponse).then((resp) => {
                    log.info('getPasses', resp);
                    resolve(resp);
                }).catch(reject);
            });
        }
        registerDeviceWithPass(device, pass) {

        }
        findPassesForDevice(device) {

        }
        findPassBySerial(serial) {
            logger('findPassBySerial', serial);
            return this.findOne({
                docType: 'pass',
                serialNumber: serial
            });
        }
        bulk(docs){
            return this.db.bulkDocs(docs);
        }
    }

    return new Passes(program);
};
