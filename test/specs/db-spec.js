'use strict';

const assert = require('assert');
const path = require('path');
const _ = require('lodash');

var testId = 'test-doc';


const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const DB = require(path.resolve(__dirname, '../../src/db.js'));

var testDocs = [];

var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;


var db;

function cleanTestDocs(done) {
  var _done = _.after(testDocs.length, function() {
    console.log('removed all docs', testDocs.length);
    done();
  });
  for (var i = 0; i < testDocs.length; i++) {
    console.log('remove', testDocs[i]._id);
    db.remove(testDocs[i]._id, testDocs[i]._rev).then(function(res) {
      console.log('removed', res);
      _done();
    });
  }
}
/* global describe, before, after, it, xit */

describe('db adapters', function() {

  describe('file system', function() {
    before(function(done) {
      db = new DB(path.resolve(__dirname, '../temp/tempdb'));
      done();
    });

    after(function(done) {
      cleanTestDocs(done);
      done();
    });

    it('should be defined', function(done) {
      assert(db);
      done();
    });

    it('should have allDocs, get, remove, put methods', function(done) {
      assert(db.allDocs, 'should have allDocs');
      assert(db.remove);
      assert(db.put);
      assert(db.get);
      assert(db.find, 'should have find');
      assert(db.post, 'should have post');
      assert(db.bulkDocs, 'should have bulkDocs');
      assert(db.saveAll, 'should have saveAll');
      done();
    });

    it('bulkDocs(array) - should save array of docs', function(done) {
      var docs = mocks.mockPasses;
      docs.push(mockDevice);
      db.bulkDocs(docs).then(function(resp) {
        assert(resp, 'returns response');
        for (var i = 0; i < resp.length; i++) {
          testDocs.push(resp[i]);
        }
        done();
      });
    });

    it('put(obj) - should create file with id', function(done) {
      db.put({
        _id: 'test-file',
        name: 'test',

        docType: 'pass'
      }).then(function(resp) {
        testDocs.push(resp);
        assert(resp);
        done();
      }).catch(done);
    });

    it('post(obj) - should create doc with generated id', function(done) {
      db.post({
        name: 'test2',
        docType: 'pass'
      }).then(function(resp) {
        testDocs.push(resp);
        testId = resp._id;
        assert(resp);
        assert(resp._id);
        assert(resp._rev);
        done();
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
    });

    it('post(obj) - should create doc with generated prefixed id', function(done) {
      db.post({
        name: 'test log with prefixed id',
        docType: 'log'
      }, 'log').then(function(resp) {
        testId = resp._id;
        testDocs.push(resp);
        assert(resp);
        assert(resp._id);
        assert(resp._rev);
        done();
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
    });

    it('get(id) - should get doc with id and resolve promise', function(done) {
      db.get('test-file').then(function(resp) {
        assert(resp);
        done();
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
    });

    it('get(id) - should get doc with id and reject on error', function(done) {
      db.get('unknown-file').then(function(resp) {
        assert(!resp);
        done();
      }).catch(function(err) {
        assert(err);
        done();
      });
    });

    it('remove(id) - should remove doc with id and resolve promise', function(done) {
      db.remove('test-file').then(function(resp) {
        assert(resp);
        done();
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
    });

    it('remove(id) - should not remove doc with invalid id and reject promise', function(done) {
      db.remove('not-a-test-file').then(function(resp) {
        assert.fail(resp);
        done();
      }).catch(function(err) {
        assert(err);
        done();
      });
    });

    it('find(params) - should find params and resolve promise', function(done) {
      db.find({
        deviceLibraryIdentifier: mockDevice.deviceLibraryIdentifier
      }).then(function(resp) {
        assert(resp);
        done();
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
    });

    it('find(params) - should find object and return first match', function(done) {
      db.find({
        docType: 'pass'
      }).then(function(resp) {
        assert(resp);
        ///assert(resp.name === 'test-file');
        done();
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
    });

    it('find(params) - should find item by params and resolve promise', function(done) {
      db.find({
        serialNumber: mocks.mockPasses[0].serialNumber,
        docType: 'pass'
      }).then(function(row) {
        console.log(row)
        assert(row);
        done();
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
    });

    it('findOne(params) - should not find item by non-matching params and reject promise', function(done) {
      db.findOne({
        someKey: 'someValue'
      }).then(function(row) {
        assert.fail(row);
        done();
      }).catch(function(err) {
        assert(err);
        done();
      });
    });
  });

});
