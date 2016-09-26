var path = require('path');
var assert = require('assert');
var p;

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program();

const config = mocks.config;
var Passes = program.require('routes/passes/passes')(program);
var Pass = program.require('routes/passes/pass');

var instance;
var mocks = require('../helpers/mocks');


describe('Passes', function() {
  var mockPass = new Pass({
    serialNumber: 'mock',
    authenticationToken: 'mock',
    type: 'generic'
  });
  var mockPasses = [
    new Pass({
      _id: 'mock-generic',
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
  before(function(done) {
    Passes.bulk(mockPasses).then(function(resp) {
      //  console.log('created', resp);
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
    Passes.save(mockPass).then(function(resp) {
      assert.ok(resp);
      done();
    }, function(err) {
      assert.fail(err);
      done();
    });
  });


  it('findById() - should pass by id', function(done) {
    Passes.get(mockPass._id).then(function(resp) {
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
      _id: mockPasses[0]._id
    }).then(function(resp) {
      //  console.log(resp);
      assert(resp);
      assert(resp._id === mockPasses[0]._id);

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
      //assert(!resp);
      done();
    }).catch(function(err) {
      assert(err);
      done();
    });
  });

  it('findBySerial(num) - should return pass by serial number', function(done) {

    Passes.findPassBySerial(mockPass.serialNumber).then(function(resp) {
      mockPass = resp;
      assert.ok(resp);
      done();
    }, function(err) {
      assert.fail(err);
      done();
    });
  });

  it('remove() - should remove pass', function(done) {
    Passes.remove(mockPass).then(function(resp) {
      assert.ok(resp);
      done();
    }, function(err) {
      assert.fail(err);
      done();
    });
  });

});
