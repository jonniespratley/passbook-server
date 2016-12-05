'use strict';
const assert = require('assert');
const path = require('path');
const Configuration = require(path.resolve(__dirname, '../../src/configuration'));
var config = null;


/*global describe, it, before*/
describe('Configuration', function(){
  before(function(done){
    process.env.PASSBOOK_SERVER_MESSAGE = 'this message is from env';
    process.env.PASSBOOK_SERVER_SOME_ENV = '12345';
    done();
  });

  it('should be defined', function(done){
    assert(Configuration);
    config = new Configuration({
      some: {
        deep: {
          object: 'test'
        }
      }
    });
    done();
  });

  it('should load default', function(done){
    assert(config);
    assert(config.get, 'has get method');
    assert(config.set, 'has set method');
    done();
  });

  it('index(obj, is, value) - should set value on object by string', function(done){
    assert(config.index(config.defaults, 'webServiceURL'));
    console.log(config.index(config.defaults, 'webServiceURL'));
    done();
  });

  it('get(name) - should return value of key', function(done){
    assert(config.get('message') === 'this message is from env');
    done();
  });

  it('set(some.deep.obj, test) - should return value of key', function(done){
    assert(config.set('some.deep.obj', 'newVal'));
    done();
  });

  it('get(some.deep.obj) - should return value of key', function(done){
    assert(config.get('some.deep.obj') === 'newVal');
    done();
  });

  it('set(name) - should return value of key', function(done){
    assert(config.get('message') === 'this message is from env');
    done();
  });

  it('keyToEnv(name) - should return process.env key of name', function(done){
    assert(config.keyToEnv('teamIdentifier') === 'PASSBOOK_SERVER_TEAM_IDENTIFIER');
    done();
  });

  it('envToKey(name) - should return config key of env', function(done){
    assert(config.envToKey('PASSBOOK_SERVER_TEAM_IDENTIFIER') === 'teamIdentifier');
    done();
  });

  it('hasEnv(name) - should return true if enviorment variable set', function(done){
    assert(config.hasEnv('some.env'));
    done();
  });

  it('hasEnv(name) - should return false if enviorment variable not set', function(done){
    assert(!config.hasEnv('notSet'));
    done();
  });

  it('getEnv(name) - should return value if enviorment variable set', function(done){
    assert(config.getEnv('some.env') === '12345');
    done();
  });

  it('getEnv(name) - should return false if enviorment variable not set', function(done){
    assert(!config.getEnv('some.value'));
    done();
  });

  it('should return ENV name', function(done){
    assert(config.env('passTypeIdentifier') === 'PASSBOOK_SERVER_PASS_TYPE_IDENTIFIER');
    assert(config.env('webServiceURL') === 'PASSBOOK_SERVER_WEB_SERVICE_URL');
    done();
  });

});
