'use strict';
const _ = require('lodash');
const assert = require('assert');
const async = require('async');
const Registration = require('./registration');
const Device = require('./device');
const Passes = require('../passes/passes');

const log = require('npmlog');
module.exports = function(program) {
	const db = program.db;
	//log.heading = 'devices-controller';
	var logger = program.getLogger('controller:devices');
	return {
		/*
		 # Registration
		 # register a device to receive push notifications for a pass
		 #
		 # POST /v1/devices/<deviceID>/registrations/<typeID>/<serial#>
		 # Header: Authorization: ApplePass <authenticationToken>
		 # JSON payload: { "pushToken" : <push token, which the server needs to send push notifications to this device> }
		 #
		 # Params definition
		 # :device_id      - the device's identifier
		 # :pass_type_id   - the bundle identifier for a class of passes, sometimes refered to as the pass topic, e.g. pass.com.apple.backtoschoolgift, registered with WWDR
		 # :serial_number  - the pass' serial number
		 # :pushToken      - the value needed for Apple Push Notification service
		 #
		 # server action: if the authentication token is correct, associate the given push token and device identifier with this pass
		 # server response:
		 # --> if registration succeeded: 201
		 # --> if this serial number was already registered for this device: 304
		 # --> if not authorized: 401

		 post '/v1/devices/:device_id/registrations/:pass_type_id/:serial_number'
		 */
		post_device_registration: function(req, res, next) {

			logger('post_device_registration', req.url);
			logger('post_device_registration', 'params', req.params);
			logger('post_device_registration', 'Handling registration request...');

			let device_id = req.params.device_id;
			let pass_type_id = req.params.pass_type_id;
			let serial_number = req.params.serial_number;
			let push_token = req.body.pushToken;
			let authentication_token = req.get('Authorization');
			let device = null;
			let registration = null;
			//Pass has an _id of the passTypeIdentifier + serial_number
			let passId = (`${pass_type_id}-${serial_number}`).replace(/\./g, '-');
			let pass = {
				_id: passId
			};
			log.info('Finding pass with id', passId);
			logger('post_device_registration', 'authentication =', authentication_token);
			logger('post_device_registration', 'device_id =', device_id);
			logger('post_device_registration', 'pass_type_id =', pass_type_id);
			logger('post_device_registration', 'serial_number =', serial_number);
			logger('post_device_registration', 'push_token =', push_token);

			if (!authentication_token) {
				return res.status(401).json({
					error: 'Unauthorized'
				});
			}


			// TODO: Steps for registering a new device/

			//1. Find passs
			//2. Find device
				//Not found insert
			//Found return


			function findPass(id, cb){
				log.info('findPass', id);
				//Reject if pass not found
				db.get(passId).then(function(resp){
					pass = resp;
					log.info('Found pass', resp._id);
					cb(null, resp);
				}).catch(function(err){
					log.error('Did not find pass', id);
					cb({status: 404, data: err});
				});
			}

			function buildDevice(pass, cb){
				device = new Device({
					//_id: 'device-' + device_id,
					deviceLibraryIdentifier: device_id,
					passTypeIdentifier: pass_type_id,
					authorization: authentication_token,
					pushToken: push_token,
					serialNumber: serial_number,
					pass_id: pass._id
				});


				registration = new Registration({
					pass_id: pass._id,
					serial_number: serial_number,
					pass_type_id: pass_type_id,
					device_id: device._id,
					auth_token: authentication_token,
					deviceLibraryIdentifier: device_id,
					push_token: push_token
				});
				log.info('buildDevice', device._id, registration._id);
				cb(null, {device: device, registration: registration});
			}

			function findOrCreateDevice(obj, cb){
				//# The device has already registered for updates on this pass
				db.get(obj.registration._id).then(function(reg) {
					log.info('post_device_registration', 'found', reg._id);
					cb(null, {status: 200, data: reg});
				}).catch(function(err) {
					console.log('Error', 'device not found', registration);
					db.saveAll([obj.device, obj.registration]).then(function(resp) {
						log.info('post_device_registration', 'inserted', resp);
						cb(null, {status: 201, data: resp});
					}).catch(function(err) {
						log.error('post_device_registration', 'error', err);
						err = {
							error_message: 'Device already registered'
						};
						cb({status: 400, data: err});
					});
				});

			}

			function createOrReturnDevice(req){

			}

			async.waterfall([
			    async.apply(findPass, passId),
			    buildDevice,
			    findOrCreateDevice,
			], function (err, result) {
				log.error('error', err);
			    if(err){
					return res.status(err.status).json(err.data);
				} else {
					return res.status(result.status).json(result.data);
				}
			});




		},
		/**
		 * # Unregister
		 #
		 # unregister a device to receive push notifications for a pass
		 #
		 # DELETE /v1/devices/<deviceID>/registrations/<passTypeID>/<serial#>
		 # Header: Authorization: ApplePass <authenticationToken>
		 #
		 # server action: if the authentication token is correct, disassociate the device from this pass
		 # server response:
		 # --> if disassociation succeeded: 200
		 # --> if not authorized: 401
		 * @param req
		 * @param res
		 * @param next
		 */
		delete_device_registration: function(req, res, next) {
			logger('delete_device_registration', req.url);

			let authentication_token = `${req.get('Authorization')}`;
			let device_id = req.params.device_id;
			let pass_type_id = req.params.pass_type_id;
			let serial_number = req.params.serial_number;

			assert.ok(device_id, 'has device id');
			assert.ok(pass_type_id, 'has pass type id');
			assert.ok(serial_number, 'has serial number');

			let uuid = device_id + '-' + serial_number;
			let registration;

			let device = new Device({
				deviceLibraryIdentifier: device_id
			});

			registration = new Registration({
				serial_number: serial_number,
				auth_token: authentication_token,
				device_id: device._id
			});

			var tokensMatch = false;

			logger('delete_device_registration', 'req.authenticationToken =', authentication_token);
			if (!authentication_token) {
				res.status(401).json({
					error: 'Unauthorized'
				});
			} else {

				logger('delete_device_registration', 'Finding registration', registration._id);

				program.db.get(registration._id).then(function(reg) {
					tokensMatch = (authentication_token === reg.auth_token);

					logger('delete_device_registration', 'found', reg._id);
					logger('delete_device_registration', 'checking tokens', tokensMatch);

					if (tokensMatch) {

						logger('delete_device_registration', 'req.authenticationToken =', authentication_token);
						logger('delete_device_registration', 'registration token =', reg.auth_token);
						logger('delete_device_registration', 'Pass and authentication token match.');


						program.db.remove(reg._id).then(function(resp) {
							res.status(200).json(resp);

						}).catch(function(err) {
							res.status(404).json({
								error: 'Registration does not exist'
							});
						});

					} else {
						logger('delete_device_registration', 'Pass and authentication token DO NOT match.');
						res.status(401).json({
							error: 'Pass and authentication do not token match.'
						});
					}

				}).catch(function(err) {
					res.status(404).json({
						error: 'Registration does not exist'
					});
				});
			}
		},
		/**
		 *

		 # Updatable passes
		 #
		 # get all serial #s associated with a device for passes that need an update
		 # Optionally with a query limiter to scope the last update since
		 #
		 # GET /v1/devices/<deviceID>/registrations/<typeID>
		 # GET /v1/devices/<deviceID>/registrations/<typeID>?passesUpdatedSince=<tag>
		 #
		 # server action: figure out which passes associated with this device have been modified since the supplied tag (if no tag provided, all associated serial #s)
		 # server response:
		 # --> if there are matching passes: 200, with JSON payload: { "lastUpdated" : <new tag>, "serialNumbers" : [ <array of serial #s> ] }
		 # --> if there are no matching passes: 204
		 # --> if unknown device identifier: 404
		 #
		 #
		 * @param req
		 * @param res
		 * @param next
		 */
		get_device_passes: function(req, res, next) {
			let authentication_token = req.get('Authorization');
			let device_id = req.params.device_id;
			let pass_type_id = req.params.pass_type_id;
			let serials = [];
			let serial_number = req.params.serial_number;

			assert(device_id, 'has device id');
			assert(pass_type_id, 'has pass type id');

			log.info('get_device_passes', 'authentication_token', authentication_token);
			log.info('get_device_passes', req.method, req.url);

			if (!authentication_token) {
				log.error('no authentication_token', authentication_token);

				res.status(401).json({
					error: 'Unauthorized'
				});

			} else {

				log.info('get_device_passes', 'Make sure device is registered');
				db.allDocs({
					//docType: 'registration',
                    pass_type_id: pass_type_id,
                   // auth_token: authentication_token,
                    deviceLibraryIdentifier: device_id
				}).then(function(resp) {
					log.info('FOund', resp);

                     serials = _.map(resp.rows, (row)=>{
                        return row.serial_number;
                     });
                    log.info('get_device_passes', 'get passes for ', pass_type_id, device_id);
                    log.info('get_device_passes', 'Return matching passes', serials);
                    res.status(200).json({
                        lastUpdated: Date.now().toString(),
                        serialNumbers: serials
                    });

				}).catch(function(err) {
					log.error('no passes found for device');
					res.status(404).json({
						error_message: `No passTypeIdentifier ${pass_type_id} found for device ${device_id}`
					});
				});
			}
		}
	};
};
