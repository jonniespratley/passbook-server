'use strict';
var path = require('path');
//var config = require(path.resolve(__dirname, '../../config.js'));
var config = require(path.resolve(__dirname, '../test-config.js'));
var program = require(path.resolve(__dirname, '../../src/program.js'))({
	dataPath: path.resolve(__dirname, '../temp')
});


var Pass = require(path.resolve(__dirname, '../../src/routes/passes/pass.js'));
var Passes = require(path.resolve(__dirname, '../../src/routes/passes/passes.js'));
var Device = require(path.resolve(__dirname, '../../src/routes/devices/device.js'));

exports.mockIdentifer = {
	passTypeIdentifier: process.env.PASS_TYPE_IDENTIFIER || config.passkit.passTypeIdentifier,
	wwdr: path.resolve(__dirname, '../../certificates/wwdr-authority.pem'),
	p12: path.resolve(__dirname, `../../certificates/${config.passkit.passTypeIdentifier}.p12`),
	passphrase: 'fred'
};
program.config.defaults.passkit.passTypeIdentifier = exports.mockIdentifer.passTypeIdentifier;

console.log('MOCK program', program.config.defaults);


exports.program = program;

exports.mockPasses = [

	new Pass({
		//_id: 'mock-generic',
		description: 'Example Generic',
		serialNumber: '0123456789876543210',
		authenticationToken: '0123456789876543210',

		type: 'generic'
	}),

	new Pass({
		//_id: 'mock-boardingpass',
		description: 'Example Boarding Pass',
		type: 'boardingPass'
	}),

	new Pass({
		//_id: 'mock-coupon',
		description: 'Example Coupon',
		type: 'coupon'
	}),

	new Pass({
		//_id: 'mock-eventticket',
		description: 'Example Event Ticket',
		type: 'eventTicket'
	}),

	new Pass({
		//_id: 'mock-storecard',
		description: 'Example Store Card',
		type: 'storeCard'
	})
];

exports.mockPass = exports.mockPasses[0];

///api/v1/v1/devices/a53ae770f6bd12d04c572e653888c6c6/registrations/pass.passbookmanager.io/25df3392-f37d-48c3-a0a1-20e9edc95f8b
exports.mockDevice = new Device({
	//"_id": "device-123456789",
	"deviceLibraryIdentifier": "0000-0000-0000-" + Date.now(),

	"authorization": "ApplePass vxwxd7J8AlNNFPS8k0a8FfUFtq0ewzFdc"
});
