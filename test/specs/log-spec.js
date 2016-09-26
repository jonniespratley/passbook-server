var path = require('path');
var assert = require('assert');
var Log = require(path.resolve(__dirname, '../../src/routes/logs/log.js'));
var Passes = require(path.resolve(__dirname, '../../src/routes/passes/passes.js'));
var Device = require(path.resolve(__dirname, '../../src/routes/devices/device.js'));
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var p;

const program = mocks.program();
const config = mocks.config;


describe('Log', function() {

});
