'use strict';

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
var testDoc = {
  //  _id: testDocId,
  docType: 'test',
  name: 'Test PouchDB'
};

/* global describe, before, it, xit */

const PouchDBAdapter = require(path.resolve(__dirname, '../../src/db-pouchdb'));
const PouchDB = require('pouchdb');


describe('db adapters', function() {

  before(function(done) {
    //fs.mkdirSync('../temp');
    pouchdb = new PouchDB('pouchdb');
    //  pouchdb = new PouchDBAdapter(path.resolve(__dirname, '../temp/pouchdb'));
    done();
  });

  after(function(done) {
    //fs.mkdirSync('../temp');
    console.log('CLean', testDocs);

    pouchdb.destroy();
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
      var tempDoc = {
        name: 'jonnie',
        docType: 'test'
      }
      pouchdb.post(tempDoc).then((resp) => {
        assert(resp);
        tempDoc._id = resp.id;
        tempDoc._rev = resp.rev;
        testDocs.push(tempDoc);
        done();
      }).catch(done);
    });

    it('put(doc) - should create doc', function(done) {
      testDoc._id = 'test-' + Date.now();
      pouchdb.put(testDoc).then(function(resp) {
        assert(resp.ok);
        assert(resp.id);
        assert(resp.rev);
        testDoc._rev = resp.rev;
        done();
      }).catch(done);
    });

    it('putAttachment() - should save attachment', function(done) {
      var attachment = new Buffer(['Is there life on Mars?'], 'utf8');
      pouchdb.putAttachment(testDoc._id, 'text', testDoc._rev, attachment, 'text/plain').then(function(res) {
        testDoc._rev = res.rev;
        assert(res);
        assert.ok(res.rev);
        //  console.log('attachment resp', res);
        done();
      }).catch(done);
    });

    it('getAttachment() - should get attachment', function(done) {
      pouchdb.getAttachment(testDoc._id, 'text').then(function(res) {


        assert(res);
        done();
      }).catch(done);
    });

    it('removeAttachment() - should remove attachment', function(done) {
      pouchdb.removeAttachment(testDoc._id, 'text', testDoc._rev).then(function(res) {

        assert(res);
        done();
      }).catch(done);
    });

    it('get(doc) - should get doc', function(done) {
      pouchdb.get(testDoc._id).then(function(resp) {
        assert(resp._id);
        assert(resp._rev);
        testDoc._rev = resp._rev;
        done();
      }).catch(done);
    });

    it('bulkDocs(docs) - should resolve bulk insert docs', function(done) {
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
      pouchdb.remove(testDoc).then(function(resp) {
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


    it('bulkDocs(docs) - should resolve bulk remove docs', function(done) {
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


  });

});
