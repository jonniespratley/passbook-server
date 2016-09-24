var path = require('path');
var assert = require('assert');
var p;

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var Passes = program.require('routes/passes/passes')(program);
var Pass = program.require('routes/passes/pass');
var config = program.config.defaults;
var instance;
var mocks = require('../helpers/mocks');


describe('Passes', function() {
  mocks.mockPass = new Pass({
    serialNumber: 'mock',
    authenticationToken: 'mock',
    type: 'generic'
  });
mocks.mockPasses = [
  mocks.mockPass,
  new Pass({
    //_id: 'mock-generic',
    description: 'Example Generic',
    serialNumber: '111111',
    authenticationToken: '111111',

    type: 'generic'
  }),

  new Pass({
    serialNumber: '222222',
    description: 'Example Boarding Pass',
    authenticationToken: '111111',
    type: 'boardingPass'
  }),
];
  before(function(done){
    Passes.bulk(mocks.mockPasses).then(function(resp){
      console.log('created', resp);
      done();
    });
  });

	it('should be defined', function(done) {
		assert(Passes);
		done();
	});

	it('getPasses() - should return all passes', function(done) {
		Passes.getPasses().then(function(resp) {
			assert(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});


	it('save() - should create/update pass', function(done) {
		Passes.save(mocks.mockPass).then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});


	it('get() - should get pass', function(done) {
		Passes.get(mocks.mockPass._id).then(function(resp) {
			assert(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});

	});


	it('findOne(params) - should resolve pass that meets params', function(done) {
		Passes.findOne({
			//_id: 'mock-generic'
			serialNumber: mocks.mockPass.serialNumber
		}).then(function(resp) {
			console.log(resp);
			assert.ok(resp.serialNumber === mocks.mockPass.serialNumber);
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

	it('findOne(params) - should reject promise pass that meets params', function(done) {
		Passes.findOne({
			//_id: 'mock-generic'
			serialNumber: 'none'
		}).then(function(resp) {
			assert.fail(resp);
			done();
		}).catch(function(err) {
			assert.ok(err);
			done();
		});
	});

	it('findBySerial(num) - should return pass by serial number', function(done) {

		Passes.findPassBySerial(mocks.mockPass.serialNumber).then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

	it('remove() - should remove pass', function(done) {
		Passes.remove(mocks.mockPass._id).then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

});
