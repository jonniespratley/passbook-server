'use strict';
const request = require('request');
const path = require('path');
const crypto = require('crypto');
const pkg = require(path.resolve(__dirname, '../package.json'));
const debug = require('debug');

var utils = {};
utils.getLogger = function(name) {
	return debug(pkg.name + ':' + name);
};

var logger = utils.getLogger('utils');


function checksum(str, algorithm, encoding) {
	return crypto
		.createHash(algorithm || 'md5')
		.update(str, 'utf8')
		.digest(encoding || 'hex')
}
utils.checksum = checksum;

module.exports = utils;
