'use strict';
const path = require('path');
const assert = require('assert');
const Chance = require('chance');

const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program();
const config = mocks.config;

var Passes = program.require('routes/passes/passes')(program);
const Pass = program.require('routes/passes/pass');



var chance = new Chance();
var p;
var instance;

describe('Passes', function () {
  var mockPassRev = null;
  var mockPassId = null;
  var mockPass = new Pass({
    type: 'generic'
  });

  var p = new Pass({
    type: 'generic',
    _id: 'test-pass-' + Date.now()
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
    Passes = program.require('routes/passes/passes')(program);
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
      assert(resp.rev, 'returns rev');
      assert(resp.id, 'returns id');
      mockPass._id = resp.id;
      mockPass._rev = resp.rev;
      done();
    }, function (err) {
      assert.fail(err);
      done();
    });
  });

  it('update() - should update pass', function (done) {
    Passes.update(mockPass).then(function (resp) {
      assert(resp);
      done();
    }, function (err) {
      assert.fail(err);
      done();
    });
  });

  describe('Finding', function () {
    it('findById() - should pass by id', function (done) {
      Passes.create(p).then(function (resp) {
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

    it('get(id) - should resolve pass by id', function (done) {
      Passes.get('pass-io-passbookmanager-test-mock-coupon').then(function (resp) {
        assert(resp);
        assert(resp._id === 'pass-io-passbookmanager-test-mock-coupon');
        done();
      }, function (err) {
        assert.fail(err);
        done();
      });
    });

    it('findOne(params) - should resolve pass that meets params', function (done) {
      Passes.findOne({
        //_id: 'mock-generic'
        serialNumber: mockPass.serialNumber
      }).then(function (resp) {
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

    it('findPassBySerial(num) - should return pass by serial number', function (done) {
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
