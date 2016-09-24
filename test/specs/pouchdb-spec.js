'use strict';

const assert = require('assert');
const path = require('path');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var testId = 'test-doc';

var config = mocks.config;
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;

var pouchdb, program = mocks.program;

/* global describe, before, it, xit */

describe('db', function () {
	//const PouchDB = program.require('db-pouchdb');
  const PouchDB = require('pouchdb');

	before(function (done) {
        //fs.mkdirSync('../temp');
		pouchdb = new PouchDB('../temp/db');
		done();
	});

	describe('PouchDb', function () {
		var testDocs = [{
			type: 'test',
			name: 'test-doc-1'
		}, {
			type: 'test',
			name: 'test-doc-2'
		}];
		var testDocId = 'test-pouchdb-doc-' + Date.now();
		var testDoc = {
			_id: testDocId,
			type: 'test',
			name: 'Test PouchDB'
		};

		before(function (done) {
			pouchdb = new PouchDB(path.resolve(__dirname, '../temp/pouchdb'));
			done();
		});

		it('should be defined', function (done) {
			assert(pouchdb);
			done();
		});

		it('should have allDocs, get, remove, put methods', function (done) {
			assert(pouchdb.allDocs, 'should have allDocs');
			assert(pouchdb.remove, 'should have remove');
			assert(pouchdb.put, 'should have put');
			assert(pouchdb.get, 'should have get');
			assert(pouchdb.post, 'should have post');
			assert(pouchdb.bulkDocs, 'should have bulkDocs');
			done();
		});

		it('post(doc) - should create doc with generated id', (done) => {
			pouchdb.post({
				name: 'jonnie',
				type: 'test'
			}).then((resp) => {
				assert(resp);
				done();
			}).catch(done);
		});



		it('put(doc) - should create doc', function (done) {
			pouchdb.put(testDoc).then(function (resp) {
				testDoc._rev = resp.rev;
				assert(resp.ok);
				assert(resp.id);
				assert(resp.rev);
				done();
			});
		});

		it('putAttachment() - should save attachment', function (done) {
			var attachment = new Buffer(['Is there life on Mars?'], 'utf8');
			pouchdb.putAttachment(testDoc._id, 'text', testDoc._rev, attachment, 'text/plain').then(function (res) {
				testDoc._rev = res.rev;
				assert(res);
				console.log('attachment resp', res);
				done();
			});
		});

		it('getAttachment() - should get attachment', function (done) {
			pouchdb.getAttachment(testDoc._id, 'text').then(function (res) {
				console.log('attachment resp', res);

				assert(res);
				done();
			});
		});

		it('removeAttachment() - should remove attachment', function (done) {
			pouchdb.removeAttachment(testDoc._id, 'text', testDoc._rev).then(function (res) {

				assert(res);
				done();
			});
		});

		it('get(doc) - should get doc', function (done) {
			pouchdb.get(testDoc._id).then(function (resp) {
				assert(resp._id);
				assert(resp._rev);
				testDoc._rev = resp._rev;
				done();
			});
		});

		it('bulkDocs(docs) - should resolve bulk insert docs', function (done) {
			pouchdb.bulkDocs(testDocs).then(function (resp) {
				assert(resp.length);
				for (var i = 0; i < resp.length; i++) {
					testDocs[i]._rev = resp[i].rev;
					testDocs[i]._id = resp[i].id;
				}
				done();
			});
		});

		it('bulkDocs(docs) - should resolve bulk remove docs', function (done) {
			for (var i = 0; i < testDocs.length; i++) {
				testDocs[i]._deleted = true;
			}
			pouchdb.bulkDocs(testDocs).then(function (resp) {
				for (var i = 0; i < resp.length; i++) {
					assert(resp[i].ok);
				}
				done();
			});
		});

		it('remove(id, rev) - should remove doc', function (done) {
			pouchdb.remove(testDoc).then(function (resp) {
				assert(resp.ok);
				done();
			});
		});

		it('allDocs() - should resolve array of docs', function (done) {
			pouchdb.allDocs({
				include_docs: true
			}).then(function (resp) {
				assert(resp.rows);
				done();
			});
		});

		it('query() - should resolve array of docs', function (done) {
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
			}).then(function (resp) {
				assert(resp.rows);

				console.log('query resp', resp);
				done();
			});
		});


		xdescribe('Other Methods', () => {

			it('findOne(params) - should resolve with first document found by params', (done) => {
				pouchdb.findOne({
					name: 'jonnie'
				}).then((resp) => {
					assert(resp);
					assert(resp.name === 'jonnie', 'returns correct doc');
					done();
				}).catch(done);
			});

			it('findOne(params) - should reject with if no document found', (done) => {
				pouchdb.findOne({
					name: 'unknown-doc'
				}).then((resp) => {
					assert(!resp);
					done();
				}).catch((resp) => {
					assert(resp);
					done();
				});
			});
		});
	});



});
