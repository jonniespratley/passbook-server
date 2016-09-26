'use strict';
var path = require('path');
var assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
//const program = mocks.program();

const config = mocks.config;
var program = require(path.resolve(__dirname, '../../src/program.js'))(config);
describe('program', function() {
	it('should defined', function(done) {
		assert(program);
		done();
	});
	it('should have getLogger', function(done) {
		assert(program.getLogger);
		done();
	});
	it('should have db', function(done) {
		assert(program.db);
		done();
	});
});
