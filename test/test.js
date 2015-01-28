/*global describe, it */
'use strict';
var assert = require('assert');
var passbookServer = require('../');

describe('passbook-server node module', function () {
  it('must have at least one test', function () {
    passbookServer();
    assert(false, 'I was too lazy to write any tests. Shame on me.');
  });
});
