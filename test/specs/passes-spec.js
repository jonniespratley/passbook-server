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
const Chance = require('chance');
var chance = new Chance();
describe('Passes', function () {
  var mockPassRev = null;
  var mockPassId = null;
  var mockPass = new Pass({
    type: 'generic'
  });

  var mockPasses = [
    new Pass({
      description: 'Example Generic',
      type: 'generic'
    }),

    new Pass({
      description: 'Example Boarding Pass',
      type: 'boardingPass'
    }),
  ];

  before(function (done) {

    Passes.bulk(mockPasses).then(function (resp) {
      done();
    }).catch((err) => {
      console.log(err);
      done();
    });

  });

  it('should be defined', function (done) {
    assert(Passes);
    done();
  });

  it('getPasses() - should return all passes', function (done) {
    Passes.getPasses().then(function (resp) {
      assert(resp);
      done();
    }, function (err) {
      assert.fail(err);
      done();
    });
  });

  it('create() - should create pass', function (done) {
    Passes.create(mockPass).then(function (resp) {
      mockPassRev = resp.rev;
      console.log(resp);
      assert(resp.rev, 'returns rev');
      assert(resp.id, 'returns id');
      mockPass._id = resp.id;
      mockPass._rev = resp.rev;
      done();
    }, function (err) {
      console.log(err);
      assert.fail(err);
      done();
    });
  });

  it('update() - should update pass', function (done) {
    Passes.update(mockPass).then(function (resp) {
      assert(resp);
      done();
    }, function (err) {
      console.log(err);
      assert.fail(err);
      done();
    });
  });

  var p = new Pass({
    type: 'generic',
    _id: 'test-pass-' + Date.now()
  });
  describe('Finding', function () {
    it('findById() - should pass by id', function (done) {

      Passes.create(p).then(function (resp) {
        console.log('created', resp);
        Passes.findById(resp.id).then(function (resp) {
          p = resp;

          assert(resp);
          done();
        }, function (err) {
          assert.fail(err);
          done();
        });
      });

    });

    it('findOne(params) - should resolve pass that meets params', function (done) {
      Passes.findOne({
        //_id: 'mock-generic'
        serialNumber: mockPass.serialNumber
      }).then(function (resp) {
        console.log(resp);
        assert(resp);


        done();
      }, function (err) {
        assert.fail(err);
        done();
      });
    });

    it('findOne(params) - should reject promise pass that meets params', function (done) {
      Passes.findOne({
        //_id: 'mock-generic'
        serialNumber: 'none'
      }).then(function (resp) {
        //assert(!resp);
        done();
      }).catch(function (err) {
        assert(err);
        done();
      });
    });

    it('findBySerial(num) - should return pass by serial number', function (done) {
      this.slow(5000);
      Passes.findPassBySerial(p.serialNumber).then(function (resp) {
        assert(resp);
        // assert(resp.serialNumber === mockPass.serialNumber);
        done();
      }, function (err) {
        assert.fail(err);
        done();
      });
    });
  });

  it('remove() - should remove pass', function (done) {
    Passes.remove(p).then(function (resp) {
      assert(resp);
      done();
    }, function (err) {
      assert.fail(err);
      done();
    });
  });

});
