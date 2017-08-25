'use strict';
/*global describe, it, before*/
const request = require('supertest');
const path = require('path');
const assert = require('assert');

const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const Main = require(path.resolve(__dirname, '../../src/main.js'));

var config = mocks.config;

var app;
var agent;


var middleware = [
	path.resolve(__dirname, '../../src/routes/admin'),
	path.resolve(__dirname, '../../src/routes/passes'),
	path.resolve(__dirname, '../../src/routes/devices'),
	path.resolve(__dirname, '../../src/routes/logs')
];
//config.middleware = middleware;
var main = null;
describe('Main.js', function() {
  before(function(){
    main = new Main(config);
  });

	it('should be defined', function(done) {
		assert(main);
		done();
	});

	it('Server.getExpressApp() - should return express app', function(done) {
		app = main.Server.getExpressApp();
		assert(app);
		done();
	});

	it('program - should return program', function(done) {
		assert(main.program);
		done();
	});

	it('app - should return app', function(done) {
		assert(main.app === app);
		done();
	});

	describe('Routes', function() {
		before(function(done) {
			app = main.Server.getExpressApp();
			agent = request.agent(app);
			done();
		});

		it('GET - /api/v1 - should return 406 if content type not avaiable', function(done) {
			agent
				.get('/api/v1')
				.set('Accept', 'text/xml')
				//.expect('Content-Type', /json/)
				.expect(406, done);
		});

		it('GET - /api/v1 - should return 200 with Content-Type /json/', function(done) {
			agent
				.get('/api/v1')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /api/v1 - should return 200 with Content-Type /html/', function(done) {
			agent
				.get('/api/v1')
				.set('Accept', 'text/html')
				.expect('Content-Type', /html/)
				.expect(200, done);
		});

		it('GET - /api/v1 - should return 200 with Content-Type /text/', function(done) {
			agent
				.get('/api/v1')
				.set('Accept', 'text/plain')
				.expect('Content-Type', /text/)
				.expect(200, done);
		});

		it('GET - /_logs - should return 200', function(done) {
			agent
				.get('/_logs')

				.expect(200, done);
		});

		it('GET - /404 - should return 404', function(done) {
			agent
				.get('/404')
				.expect('Content-Type', /html/)
				.expect(404, done);
		});

		it('GET - /500 - should return 500', function(done) {
			agent
				.get('/500')
				.expect('Content-Type', /html/)
				.expect(500, done);
		});
	});
});
