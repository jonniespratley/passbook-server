'use strict';
var path = require('path');
var assert = require('assert');
const utils = require(path.resolve(__dirname, '../../src/utils'));



//const config = mocks.config;
//var program = require(path.resolve(__dirname, '../../src/program.js'))(config);
describe('utils', function() {
  it('should defined', function(done) {
    assert(utils);
    done();
  });

  it('getLogger(name) - should return log instance', function(done) {
    let log = utils.getLogger('test');
    assert(log);

    assert(utils.getLogger);
    done();
  });

  it('index() - should return value at path', function(done) {
    var testObj = {
      obj: {
        name: 'value'
      }
    };
    assert(utils.index(testObj, 'obj.name') === 'value');
    done();
  });
  it('index(obj, name, value) - should return value at path', function(done) {
    var testObj = {
      obj: {
        name: 'value'
      }
    };
    assert(utils.index(testObj, 'obj.name') === 'value');
    done();
  });



  it('index(obj, name, value) - should set value at path', function(done) {
    var testObj = {
      obj: {

      }
    };
    assert(utils.index(testObj, 'obj.name', 'value'));
    assert(utils.index(testObj, 'obj.name') === 'value');
    done();
  });


});
