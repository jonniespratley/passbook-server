'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router;

const DevicesController = require('./devices-controller');

module.exports = function(app) {
	var program = app.locals.program;
	var logger = program.getLogger('router:devices');
	var config = program.config.defaults;
	var router = new Router();
	const prefix = `/api/${config.version}/devices`;
	var devicesController = new DevicesController(program);

	//	router.use(devicesController.use);

	router.get('/:device_id/push/:token', function(req, res) {
		logger('Push to device ' + req.params.token);
		res.status(200).send({
			message: 'Device push token'
		});
	});
	router.use(bodyParser.json());
	router.get('/:device_id/registrations/:pass_type_id?', devicesController.get_device_passes);
	router.post('/:device_id/registrations/:pass_type_id/:serial_number', bodyParser.json(), devicesController.post_device_registration);
	router.delete('/:device_id/registrations/:pass_type_id/:serial_number', devicesController.delete_device_registration);
	app.use(prefix, router);

	require('express-list-routes')({
		prefix: prefix
	}, 'API:', router);

	return router;
};
