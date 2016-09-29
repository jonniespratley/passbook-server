'use strict';

const fs = require('fs-extra');
const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var testId = 'test-doc';
var program = mocks.program();
var config = mocks.config;
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;

var pouchdb, testDocs = [];
var testDocId = 'test-pouchdb-doc-' + Date.now();


/* global describe, before, it, xit */
const dataPath = path.resolve(__dirname, '../temp/', 'passbook-server');
const PouchDBAdapter = require(path.resolve(__dirname, '../../src/db-pouchdb'));
const PouchDB = require('pouchdb');
var tempDoc = {
  name: 'jonnie',
  docType: 'test'
}

describe('db adapters', function() {

  before(function(done) {
    fs.ensureDirSync(dataPath);
    //fs.mkdirSync('../temp');
    //pouchdb = new PouchDB(dataPath);
    pouchdb = new PouchDBAdapter(dataPath);

    done();
  });

  after(function(done) {
    //fs.mkdirSync('../temp');
    //console.log('CLean', testDocs);
    fs.removeSync(dbPath);

    //pouchdb.destroy();
    done();
  });

  describe('PouchDb', function() {

    testDocs = [{
      docType: 'test',
      name: 'test-doc-1'
    }, {
      docType: 'test',
      name: 'test-doc-2'
    }];


    it('should be defined', function(done) {
      assert(pouchdb);
      done();
    });

    it('should have allDocs, get, remove, put methods', function(done) {
      assert(pouchdb.allDocs, 'should have allDocs');
      assert(pouchdb.remove, 'should have remove');
      assert(pouchdb.put, 'should have put');
      assert(pouchdb.get, 'should have get');
      assert(pouchdb.getAttachment, 'should have putAttachment');
      assert(pouchdb.removeAttachment, 'should have removeAttachment');
      assert(pouchdb.putAttachment, 'should have putAttachment');
      assert(pouchdb.post, 'should have post');
      assert(pouchdb.bulkDocs, 'should have bulkDocs');
      assert(pouchdb.query, 'should have query');
      done();
    });

    it('post(doc) - should create doc with generated id', (done) => {
      pouchdb.post(tempDoc).then((resp) => {
        assert(resp.ok, 'returns ok');
        assert(resp.id, 'returns id');
        assert(resp.rev, 'returns rev');
        tempDoc._id = resp.id;
        tempDoc._rev = resp.rev;
        done();
      }).catch(done);
    });

    it('put(doc) - should create doc', function(done) {
      pouchdb.put(tempDoc).then(function(resp) {
        assert(resp.ok, 'returns ok');
        assert(resp.id, 'returns id');
        assert(resp.rev, 'returns rev');
        tempDoc._rev = resp.rev;
        tempDoc._id = resp.id;
        done();
      }).catch(done);
    });

    context('Attachments', function() {
      var testDocAttachment = {
        name: 'test-doc-attachment'
      };
      before(function(done) {
        pouchdb.post(testDocAttachment).then(function(resp) {
          testDocAttachment._id = resp.id;
          testDocAttachment._rev = resp.rev;
          done();
        });
      })
      it('putAttachment() - should save attachment', function(done) {
        var attachment = new Buffer(['Is there life on Mars?'], 'utf8');
        pouchdb.putAttachment(testDocAttachment._id, 'text', testDocAttachment._rev, attachment,
          'text/plain').then(function(res) {
          testDocAttachment._rev = res.rev;
          assert(res);
          assert.ok(res.rev);
          //  console.log('attachment resp', res);
          done();
        }).catch(done);
      });

      it('getAttachment() - should get attachment', function(done) {
        pouchdb.getAttachment(testDocAttachment._id, 'text').then(function(res) {
          assert(res);
          done();
        }).catch(done);
      });

      it('removeAttachment() - should remove attachment', function(done) {
        pouchdb.removeAttachment(testDocAttachment._id, 'text', testDocAttachment._rev).then(function(
          res) {

          assert(res);
          done();
        }).catch(done);
      });
    });

    it('get(doc) - should get doc', function(done) {
      pouchdb.get(tempDoc._id).then(function(resp) {
        assert(resp._id, 'returns _id');
        assert(resp._rev, 'returns _rev');
        tempDoc = resp;
        done();
      }).catch(done);
    });

    it('bulkDocs(docs) - should resolve bulk insert docs', function(done) {
      testDocs = mocks.mockPasses;
      pouchdb.bulkDocs(testDocs).then(function(resp) {
        assert(resp.length);
        for (var i = 0; i < resp.length; i++) {
          testDocs[i]._rev = resp[i].rev;
          testDocs[i]._id = resp[i].id;
        }
        done();
      }).catch(done);
    });

    it('remove(id, rev) - should remove doc', function(done) {
      pouchdb.remove(tempDoc).then(function(resp) {
        assert(resp.ok);
        done();
      }).catch(done);
    });

    it('allDocs() - should resolve array of docs', function(done) {
      pouchdb.allDocs({
        include_docs: true
      }).then(function(resp) {
        assert(resp.rows);
        done();
      }).catch(done);
    });

    it('query() - should resolve array of docs', function(done) {
      function map(doc) {
        if (doc.name) {
          emit(doc.name);
        }
      }
      pouchdb.query({
        map: map
      }, {
        reduce: false,
        include_docs: true
      }).then(function(resp) {
        assert(resp.rows);

        console.log('query resp', resp);
        done();
      }).catch(done);
    });


    xit('bulkDocs(docs) - should resolve bulk remove docs', function(done) {
      for (var i = 0; i < testDocs.length; i++) {
        testDocs[i]._deleted = true;
      }
      pouchdb.bulkDocs(testDocs).then(function(resp) {
        for (var i = 0; i < resp.length; i++) {
          assert(resp[i].ok);
        }
        done();
      }).catch(done);
    });


    var PassbookViews = {
      passes: (doc) => {
        if (doc.docType === 'pass') {
          emit(doc.serialNumber);
        }
      }
    };



    it('query() - should resolve array of passes', function(done) {
      pouchdb.query({
        map: PassbookViews.passes
      }, {
        reduce: false,
        include_docs: true
      }).then((resp) => {
        assert(resp.rows);
        console.log('query resp', resp);
        done();
      }).catch(done);
    });


    describe('Sync', () => {
      it('sync() - should replicate from local to remote', (done) => {
        pouchdb.sync(dataPath, 'http://localhost:4987/passbook-server-')
          .on('change', function(info) {
            program.log.info('change', info);
            // handle change
          }).on('complete', function(info) {
            program.log.info('complete', info);
            assert(info, 'sync complete');
            done();
            // handle complete
          }).on('uptodate', function(info) {
            program.log.info('uptodate', info);
            // handle up-to-date
          }).on('error', function(err) {
            assert.fail(err, 'sync fails');
            program.log.info('error', info);
            // handle error
            done();
          });

        sync.cancel(); // whenever you want to cancel
        done();
      });
    });
  });

});
