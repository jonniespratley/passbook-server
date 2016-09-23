'use strict';
var assert = require('assert'),
  path = require('path'),
  fs = require('fs-extra'),
  request = require('supertest'),
  express = require('express'),
  os = require('os');


//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');

var app = express();
var passes;

// TODO: Program
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var db = program.db;
var config = program.config.defaults;

//Test Instances

var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;

var mockIdentifer = mocks.mockIdentifer;
var app;

describe('passbook-server routes', function() {
  before(function(done) {
    app = express();
    app.locals.program = program;
    program.require('routes').Passes(app);
    program.require('routes').Devices(app);
    //  done();
    //request(app);
    program.db.bulkDocs(mocks.mockPasses).then(function(resp) {
      console.log('insterted', resp);
      mockPass = resp[0];
      mockDevice.authorization = 'ApplePass ' + mockPass.authenticationToken;
      done();
    }).catch(done);

  });

  it('GET - /api/v1 - should return api', function(done) {
    request(app)
      .get('/api/v1')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });


  describe('Web Service API', function() {



    describe('Devices', function() {
      it(
        'POST - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - register a new device for pass',
        function(done) {
          request(app)
            .post(
              //'/api/v1/devices/012345678987654321/registrations/pass.jsapps.io/012345678987654321'
              `/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`
            )
            .send({
              pushToken: mockDevice.pushToken
            })
            .set('Authorization', mockDevice.authorization)
            .expect('Content-Type', /json/)
            .expect(201, done);
        });

      it(
        'POST - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - return existing device for pass',
        function(done) {

          request(app)
            .post(
              //'/api/v1/devices/012345678987654321/registrations/pass.jsapps.io/012345678987654321'
              `/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`
            )
            .send({
              pushToken: mockDevice.pushToken
            })
            //.set('Authorization', 'ApplePass ' + mockPass.authenticationToken)
            .set('Authorization', mockDevice.authorization)
            .expect('Content-Type', /json/)
            .expect(200, done);
        });

      it('GET - /api/v1/devices/:device_id/push/:token - send push to device', function(done) {
        request(app)
          .get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/push/' + mockDevice.token)
          .set('Authorization', mockDevice.authorization)
          .expect('Content-Type', /json/)
          .expect(200, done);
      });

      it('GET - /api/v1/devices/:device_id/registrations/:pass_type_id - get serial numbers',
        function(done) {
          request(app)
            .get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier)
            .set('Authorization', mockDevice.authorization)
            .expect('Content-Type', /json/)
            .expect(200, done);
        });

      it(
        'GET - /api/v1/devices/:device_id/registrations/:pass_type_id?passesUpdatedSince=tag - get serial numbers',
        function(done) {
          request(app)
            .get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier +
              '?tag=now')
            .set('Authorization', mockDevice.authorization)
            .expect('Content-Type', /json/)
            .expect(200, done);
        });

      it('GET - /api/v1/devices/:device_id/:registrations/:pass_type_id', function(done) {
        request(app)
          .get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier)
          .set('Authorization', mockDevice.authorization)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            assert.ok(res.body.serialNumbers);
          })
          .expect(200, done);
      });

      it('DELETE - /api/v1/devices/:device_id/:pass_type_id/:serial_number - un-register device',
        function(done) {
          request(app)
            .delete(
              `/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`
            )

          .set('Authorization', mockDevice.authorization)
            //.expect('Content-Type', /json/)
            .expect(200, done);
        });
    });

    it('POST - /api/v1/log - should store logs', function(done) {
      request(app)
        .post('/api/v1/log')
        .send({
          logs: ['test log']
        })
        .expect('Content-Type', /json/)
        .expect(201, done);
    });

    describe('Passes', function() {

      it('GET - /api/v1/passes/:pass_type_id/:serial_number - 401', function(done) {
        request(app)
          .get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}111`)
          .expect(401, done);
      });

      it('GET - /api/v1/passes/:pass_type_id/:serial_number', function(done) {
        request(app)
          .get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`)
          .set('Authorization', mockDevice.authorization)
          //.expect('Content-Type', /application\/vnd.apple.pkpass/)
          .expect(200, done);

      });

      it('GET - /api/v1/passes/:pass_type_id/:serial_number - ?updated since date', function(done) {
        request(app)
          .get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}?updatedSince=` +
            Date.now())
          .set('Authorization', mockDevice.authorization)
          //.expect('Content-Type', /application\/vnd.apple.pkpass/)
          .expect(204, done);

      });
    });


  });
});
