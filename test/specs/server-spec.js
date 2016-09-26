'use strict';
const request = require('supertest');
const path = require('path');
const assert = require('assert');
const Server = require(path.resolve(__dirname, '../../src/server.js'));
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));

const program = mocks.program();
const config = mocks.config;

var app;
var agent;
//var main = require(path.resolve(__dirname, '../../src/main.js'))();
var middleware = [
	path.resolve(__dirname, '../../src/routes/admin'),
	path.resolve(__dirname, '../../src/routes/passes'),
	path.resolve(__dirname, '../../src/routes/devices'),
	path.resolve(__dirname, '../../src/routes/logs')
];

describe('Server', function() {

	it('should be defined', function(done) {
		assert(Server);
		done();
	});

	it('should return express app', function(done) {
		app = Server.getExpressApp();
		assert(app);
		done();
	});

	it('should set express locals', function(done) {
		Server.setExpressLocals('program', program);
		Server.setExpressLocals('config', mocks.config);
		Server.setExpressLocals('db', program.get('db'));
		assert(app.locals.program === program);
		done();
	});

	it('should mount middleware', function(done) {
		assert(Server);
		Server.setExpressMiddleware(middleware);
		done();
	});


	xdescribe('Routes', function() {
		before(function(done) {
			app = Server.getExpressApp();
			agent = request.agent(app);
			done();
		});

		it('GET - /api/v1 - should return 200', function(done) {
			agent
				.get('/api/v1')
				.set('Acc', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /404 - should return 404', function(done) {
			agent
				.get('/404')
				.expect('Content-Type', /html/)
				.expect(404, done);
		});
	});
});
