'use strict';
var path = require('path');
var assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program();

/*global describe, it*/
describe('program', function() {
	it('should defined', function(done) {
		assert(program);
		done();
	});

	it('should have getLogger', function(done) {
		done();
	});

	it('get(key) - should return module by key', function(done) {
		assert(program.get('db') === program.db);
		done();
	});

	it('set(key, val) - should set name of module', function(done) {
		program.set('testModule', {
			someKey: 'someValue'
		});
		done();
	});

	it('get(key) - should return name of module', function(done) {
		assert(program.get('testModule').someKey === 'someValue');
		done();
	});

	describe('adapters', function() {
		xit('program.setAdapter', function(done) {
			assert(program.setAdapter);
			done();
		});

		it('program.db.allDocs', function(done) {
			program.get('db').allDocs().then((resp) =>{
				mocks.log(resp);
				assert(resp);
				done();
			});
		});

		it('should have allDocs, get, remove, getAttachment, put methods', function(done) {
			assert(program.db.allDocs, 'should have allDocs');
			assert(program.db.remove, 'should have remove');
			assert(program.db.put, 'should have put');
			assert(program.db.get, 'should have get');
			assert(program.db.getAttachment, 'should have getAttachment');
			assert(program.db.removeAttachment, 'should have removeAttachment');
			assert(program.db.putAttachment, 'should have putAttachment');
			assert(program.db.post, 'should have post');
			assert(program.db.bulkDocs, 'should have bulkDocs');
			assert(program.db.query, 'should have query');
			done();
		});
	});
});
