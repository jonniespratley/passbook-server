'use strict';
/*global describe, it, before*/
const assert = require('assert');
const _ = require('lodash');
const path = require('path');
const nock = require('nock');

const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const CouchDB = require(path.resolve(__dirname, '../../src/db-couchdb.js'));

const endpoint = process.env.PASSBOOK_SERVER_DATABASE_URL || 'http://localhost:4987/default';
const testDoc = {
  _id: 'test-doc',
  name: 'test'
};
const program = mocks.program();
const config = mocks.config;

var testRandomId = Date.now();
var db;
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;
var scope;


var mockServer = function() {

  scope = nock(endpoint)

  //get
  .get(`/${testDoc._id}`)
    .query(true)
    .reply(200, testDoc)

  //put
  .put(`/${mockPass._id}`)
    .query(true)
    .reply(200, {
      id: mockPass._id
    })

  //put - create
  .put(`/${testDoc._id}`)
    .query(true)
    .reply(201, testDoc)

  //put
  .put(`/test-doc?rev=2-0000`)
    .query(true)
    .reply(200, {
      id: testDoc._id
    })

  //remove
  .get(`/test-doc`)
    .query(true)
    .reply(200, {
      id: 'test-doc'
    })
    //remove
    .delete(`/test-doc?rev=2-0000`)
    .query(true)
    .reply(200, {
      id: testDoc._id
    })
    //remove
    .delete(`/${testDoc._id}?rev=2-0000`)
    .query(true)
    .reply(200, {
      id: testDoc._id
    })

  //post
  .post(`/test-doc`)
    .reply(201, {
      id: testDoc._id
    })
  .post(`/${testRandomId}`)
    .reply(201, {
      id: testRandomId
    })

  //post
  .post(`/_bulk_docs`)
    .query(true)
    .reply(201, JSON.stringify(mocks.mockPasses))

  //put - fail
  .put('/test-fail')
    .query(true)
    .reply(404, {
      error: 'Error'
    });


};

describe('CouchDB Adapter', function() {

  before(function(done) {
    mockServer();
    db = new CouchDB(endpoint);
    done();
  });

  it('should be defined', function(done) {
    assert(db);
    done();
  });

  it('should have allDocs, get, remove, put methods', function(done) {
    assert(db.allDocs);
    assert(db.remove);
    assert(db.put);
    assert(db.get);
    assert(db.find, 'has find');
    assert(db.post, 'has post');
    assert(db.saveAll, 'has saveall');
    done();
  });

  it('db.put - should create doc with id', function(done) {
    mockPass._id = 'test-doc-' + Date.now();
    var s = nock(endpoint)
      .put(`/${mockPass._id}`)
      .query(true)
      .reply(200, {
        id: mockPass._id,
        rev: '0000'
      });
    db.put(mockPass).then(function(resp) {
      console.log(resp);
      //mockPass._rev = 1;
      assert(resp, 'returns response');
      assert(resp.id, 'has id');
      assert(resp.rev, 'has revision');
      done();
    }).catch(function(err) {
      assert.fail(err);
      done();
    });

  });

  it('db.put - should reject create doc with _id', function(done) {
    var s = nock(endpoint)
      .get(`/test-fail`)
      .query(true)
      .reply(400, {
        id: mockPass._id,
        rev: '0000'
      });
    db.put({
      _id: 'test-fail'
    }).then(function(resp) {
      assert.fail(resp);
      done();
    }).catch(function(err) {
      assert.ok(err);
      done();
    });
  });

  it('db.post - should create doc with generated', function(done) {
    let o = _.assign({}, mocks.mockPass);
    o._id = testRandomId;
    db.post(o).then(function(resp) {
      assert(resp.id, 'returns id');
      assert(resp);
      testDoc._id = resp.id;
      done();
    }).catch(function(err) {
      assert.fail(err);
      done();
    });
  });

  it('should get doc with id', function(done) {
    var s = nock(endpoint)
      .get(`/${testDoc._id}`)
      .query(true)
      .reply(200, testDoc);

    db.get(testDoc._id).then(function(resp) {
      assert(resp);
      // mockPass = resp;
      done();
    }).catch(function(err) {
      assert.fail(err);
      done();
    });
  });

  it('should find doc', function(done) {
    var s = nock(endpoint)
      .get('/_all_docs')
      .query(true)
      .reply(200, {
        rows: [{
          doc: testDoc
        }]
      });
    db.find({
      _id: testDoc._id
    }).then(function(resp) {
      console.log('find res[', resp);
      assert(resp.rows.length);
      done();
    }).catch(function(err) {
      assert.fail(err);
      done();
    });
  });

  xit('db.remove - should remove doc with id', function(done) {
    testDoc._rev = '2-0000';
    nock(endpoint)
      .get(`/${testDoc._id}`)
      .query(true)
      .reply(200, testDoc);

    var s = nock(endpoint)
      .delete(`/${testDoc._id}?rev=${testDoc._rev}`)
      .query(true)
      .reply(200, {
        id: testDoc._id
      });
      console.log(s.pendingMocks());

    db.remove(testDoc._id).then(function(resp) {
      assert(resp);
      done();
    }).catch(function(err) {
      assert.fail(err);
      done();
    });
  });

  it('should save array of docs', function(done) {
    var s = nock(endpoint)
      .get(`/${mockDevice._id}`)
      .query(true)
      .reply(200, mockDevice)
      .put(`/${mockDevice._id}`)
      .query(true)
      .reply(201, mockDevice);

    var s2 = nock(endpoint)
      .get(`/${mockPass._id}`)
      .query(true)
      .reply(200, mockPass)
      .put(`/${mockPass._id}`)
      .query(true)
      .reply(201, mockPass);

    db.saveAll([
      mockDevice,
      mockPass
    ]).then(function(resp) {
      assert(resp);
      done();
    }).catch(function(err) {
      assert.fail(err);
      done();
    });
  });

  it('db.allDocs - should return array of docs', function(done) {
    var s = nock(endpoint)
      .get('/_all_docs')
      .query(true)
      .reply(200, {
        rows: [{
          doc: testDoc
        }]
      });
    db.allDocs().then(function(resp) {
      assert(resp);
      assert(resp.rows);
      done();
    }).catch(function(err) {
      assert.fail(err);
      done();
    });
  });

  it('should find doc by params', function(done) {
    var s = nock(endpoint)
      .get('/_all_docs')
      .query(true)
      .reply(200, {
        rows: [{
          doc: testDoc
        }]
      });
    db.find({}).then(function(resp) {
      //assert(resp[0].serialNumber === mockPass.serialNumber, 'returns object');
      assert(resp);
      done();
    }).catch(function(err) {
      assert.fail(err);
      done();
    });
  });


});
