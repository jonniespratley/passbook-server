'use strict';
/**
 * Created by jps on 12/17/15.
 */
var assert = require('assert'),
	_ = require('lodash'),

	path = require('path');


var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;

var config = program.config.defaults;
var CouchDB = program.require('db-couchdb') || require(path.resolve(__dirname, '../../lib/adapters/db-couchdb.js'));

var testDoc = {
	_id: 'test-doc',

	name: 'test'
};

var db = new CouchDB(config);

var mockDevice = mocks.mockDevice;
var mockPass = _.assign({}, mocks.mockPass);

var nock = require('nock');
var scope;

var mockServer = function() {
	console.log('Mocking server', config.baseUrl);
	console.dir(config);
	scope = nock(config.baseUrl)

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

	//put
	.put(`/test-doc`)
		.query(true)
		.reply(200, testDoc)

	//put
	.put(`/test-doc?rev=2-0000`)
		.query(true)
		.reply(200, {
			id: testDoc._id
		})

	//remove
	.delete(`/test-doc?rev=2-0000`)
		.query(true)
		.reply(200, {
			id: testDoc._id
		})

	//post
	.post(`/test-doc`)
		.reply(201, {
			id: testDoc._id
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
		})

	.get('/_all_docs')
		.query(true)
		.reply(200, {
			rows: [{
				doc: testDoc
			}]
		});
}

require('request').debug = true;
xdescribe('CouchDB Adapter', function() {

	before('should be defined - ' + config.baseUrl, function(done) {
		mockServer();

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
		db.post(mockPass).then(function(resp) {
			console.log(resp);
			//mockPass._rev = 1;
			assert(resp, 'returns response');
			//assert(resp.id, 'has id');
			//assert(resp.rev, 'has revision');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('db.put - should reject create doc with _id', function(done) {
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
		delete o._id;
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

	xit('should get doc with id', function(done) {
		db.get(testDoc._id).then(function(resp) {
			assert(resp);
			assert(resp.name === testDoc.name, 'returns object');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('should find doc', function(done) {
		db.find({
			name: testDoc.name
		}).then(function(resp) {
			console.log('find res[', resp);
			assert(resp.name === testDoc.name, 'returns object');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('db.remove - should remove doc with id', function(done) {
		testDoc._rev = '2-0000';
		db.remove(testDoc._id, testDoc._rev).then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should save array of docs', function(done) {
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
		db.allDocs().then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should find doc by params', function(done) {
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
