'use strict';

const assert = require('assert');
const path = require('path');
const _ = require('lodash');

var testId = 'test-doc';
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const DB = require(path.resolve(__dirname, '../../src/db.js'));
var Pass = mocks.Pass;
var Device = mocks.Device;
var testDocs = [];
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;
var db,testDoc;

function cleanTestDocs(done) {
  var _done = _.after(testDocs.length, function () {
    console.log('removed all docs', testDocs.length);
    done();
  });
  for (var i = 0; i < testDocs.length; i++) {
    console.log('remove', testDocs[i]._id);
    db.remove(testDocs[i]._id, testDocs[i]._rev).then(function (res) {
      console.log('removed', res);
      _done();
    });
  }
}
/* global describe, before, after, it, xit */

describe('db adapters', function () {

  describe('file system', function () {
    before(function (done) {
      db = new DB(path.resolve(__dirname, '../temp/tempdb'));
      done();
    });

    after(function (done) {
      cleanTestDocs(done);

    });

    it('should be defined', function (done) {
      assert(db);
      done();
    });

    it('should have allDocs, get, remove, put methods', function (done) {
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

    it('bulkDocs(array) - should save array of docs', function (done) {
      var docs = [

        new Pass({
          description: 'Example Boarding Pass',
          type: 'boardingPass'
        }),

        new Pass({
          description: 'Example Coupon',
          type: 'coupon'
        }),

        new Pass({
          description: 'Example Event Ticket',
          type: 'eventTicket'
        }),

        new Pass({
          description: 'Example Store Card',
          type: 'storeCard'
        })
      ];


      db.bulkDocs(docs).then(function (resp) {
        var _done = _.after(resp.length, function () {
          testDoc = testDocs[0];
          assert(testDocs);
          done();
        });
        _.forEach(resp, function (doc) {
          testDocs.push(doc);
          _done();
        });
      });
    });

    it('put(obj) - should create file with id', function (done) {
      db.put({
        _id: 'test-file',
        name: 'test',
        docType: 'file'
      }).then(function (resp) {
        testDocs.push(resp);
        assert(resp);
        done();
      }).catch(done);
    });

    it('post(obj) - should create doc with generated id', function (done) {
      db.post({
        name: 'test2',
        docType: 'file'
      }).then(function (resp) {
        testDocs.push(resp);
        testId = resp._id;
        assert(resp);
        assert(resp._id);
        assert(resp._rev);
        done();
      }).catch(function (err) {
        assert.fail(err);
        done();
      });
    });

    it('post(obj) - should create doc with generated prefixed id', function (done) {
      db.post({
        name: 'test log with prefixed id',
        docType: 'log'
      }, 'log').then(function (resp) {
        testId = resp._id;
        testDocs.push(resp);
        assert(resp);
        assert(resp._id);
        assert(resp._rev);
        done();
      }).catch(function (err) {
        assert.fail(err);
        done();
      });
    });

    it('get(id) - should get doc with id and resolve promise', function (done) {
      db.get('test-file').then(function (resp) {
        assert(resp);
        done();
      }).catch(function (err) {
        assert.fail(err);
        done();
      });
    });

    it('get(id) - should get doc with id and reject on error', function (done) {
      db.get('unknown-file').then(function (resp) {
        assert(!resp);
        done();
      }).catch(function (err) {
        assert(err);
        done();
      });
    });

    it('findOne(params) - should find first object by params and resolve promise', function (done) {
      db.findOne({
        _id: testDocs[0]._id
      }).then(function (resp) {
        assert(resp._id);
        //assert(resp.deviceLibraryIdentifier === mockDevice.deviceLibraryIdentifier);
        done();
      }).catch(function (err) {
        assert.fail(err);
        done();
      });
    });

    it('find(params) - should find item by params and resolve promise', function (done) {
      db.find({
        docType: 'file'
      }).then(function (resp) {
        console.log(resp);
        assert(resp);
        assert(resp.length);
        done();
      }).catch(function (err) {
        assert.fail(err);
        done();
      });
    });

    it('findOne(params) - should not find item by non-matching params and reject promise', function (done) {
      db.findOne({
        someKey: 'someValue'
      }).then(function (row) {
        assert.fail(row);
        done();
      }).catch(function (err) {
        assert(err);
        done();
      });
    });

    it('remove(id) - should remove doc with id and resolve promise', function (done) {
      db.remove('test-file').then(function (resp) {
        assert(resp);
        done();
      }).catch(function (err) {
        assert.fail(err);
        done();
      });
    });

    it('remove(id) - should not remove doc with invalid id and reject promise', function (done) {
      db.remove('not-a-test-file').then(function (resp) {
        assert.fail(resp);
        done();
      }).catch(function (err) {
        assert(err);
        done();
      });
    });
  });

});
