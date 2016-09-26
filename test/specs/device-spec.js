'use strict';
const path = require('path');

const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program();

const config = mocks.config;
const Device = program.require('routes/devices/device');

var d;

/* global describe, before, it */
describe('Device Model', function() {
  before(function() {
    d = new Device({
      pushToken: '0123456789876543210',
      deviceLibraryIdentifier: '0123456789876543210',
      serialNumber: '0123456789876543210',
      passTypeIdentifier: mocks.mockIdentifer.passTypeIdentifier
    });
  });

  it('should be defined', function(done) {
    assert(Device);
    done();
  });

  it('should throw error if no deviceLibraryIdentifier', function() {
    assert.throws(function() {
      new Device({
        pushToken: '1234'
      });
    });
  });

});
