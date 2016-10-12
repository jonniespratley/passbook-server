'use strict';
const path = require('path');
const assert = require('assert');
const PassbookServer = require(path.resolve(__dirname, '../../src/index.js'));
const Log = require(path.resolve(__dirname, '../../src/routes/logs/log.js'));
//const mocks = require(path.resolve(__dirname, '../helpers/mocks'));

var p;




describe('Log', function() {

});

describe('Index', function() {
  it('Program - should be defined', (done) =>{
    assert(PassbookServer.Program);
    done();
  });
});
