'use strict';
const path = require('path');
const assert = require('assert');
const PassbookServer = require(path.resolve(__dirname, '../../src/index.js'));
const Log = require(path.resolve(__dirname, '../../src/routes/logs/log.js'));
//const mocks = require(path.resolve(__dirname, '../helpers/mocks'));

var p;



describe('Index', function() {
  it('Program - should be defined', (done) =>{
    assert(PassbookServer.Program);
    done();
  });
  it('Configuration - should be defined', (done) =>{
    assert(PassbookServer.Configuration);
    done();
  });
  it('PouchDBAdapter - should be defined', (done) =>{
    assert(PassbookServer.PouchDBAdapter);
    done();
  });
  it('DB - should be defined', (done) =>{
    assert(PassbookServer.DB);
    done();
  });
  it('CouchDBAdapter - should be defined', (done) =>{
    assert(PassbookServer.CouchDBAdapter);
    done();
  });
  it('utils - should be defined', (done) =>{
    assert(PassbookServer.utils);
    done();
  });
  it('Server - should be defined', (done) =>{
    assert(PassbookServer.Server);
    done();
  });
});
