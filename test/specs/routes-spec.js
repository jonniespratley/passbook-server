'use strict';
/* global describe, before, after, it*/
var assert = require('assert'),
  path = require('path'),
  fs = require('fs-extra'),
  request = require('supertest'),
  express = require('express');


//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');




// TODO: Program
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));


//Test Instances
// var passes;
var program, db, app;
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;
var mockIdentifer = mocks.mockIdentifer;

const config = mocks.config;
const Pass = mocks.Pass;
const Device = mocks.Device;

var passes = mocks.getMockPasses(5);
const fixtures = {
  setup(){
    return new Promise((resolve, reject) =>{
      app = mocks.main().app;
      program = mocks.main().program;
      db = program.get('db');
      app.locals.program = program;
      app.locals.db = program.db;

      program.require('routes').Logs(app);
      program.require('routes').Passes(app);
      program.require('routes').Devices(app);
      program.require('routes/download')(app);
      program.require('routes/browse')(app);

      db.bulkDocs(passes).then((resp) =>{
        console.log('Inserted', resp);
        db.find({docType: 'pass'}).then((r) =>{
          passes = r;
          mockPass = r[0];
          resolve(mockPass);
        }).catch((err)=>{
          reject(new Error(err));
        });
      }).catch((err)=>{
        reject(new Error(err));
      });
    });
  },
  teardown(){
    return new Promise((resolve, reject) =>{
      var all = [];
      for (var i = 0; i < passes.length; i++) {
        let id = passes[i]._id;
        let rev = passes[i]._rev;
        console.log('Removing pass', id, rev);
        all.push(db.remove(id, rev));
      }
      Promise.all(all).then(resolve, reject);
    });
  }
};



describe('passbook-server routes', function () {

  before(function (done) {
    fixtures.setup().then(() => {
      done();
    });
  });
  after(function (done) {
    //.teardown().then(done).catch(done);
    done();
  });

  describe('Public API', function(){
    it('GET - 200 - /_browse', function (done) {
      request(app)
        .get('/_browse')
        //.set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
        //.expect('Content-Type', /json/)
        .expect(200, done);
    });
    //http://localhost:5353/download/pass-io-passbookmanager-test-mock-eventticket
    it(`GET - 200 - /_download/${mockPass._id}`, function (done) {
      request(app)
        .get(`/_download/${mockPass._id}`)
        .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
        //.expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe('Web Service API', function () {

    describe('Devices', function () {
      it('POST - 201 - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - register a new device for pass', (done) => {
        var url = `/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`;
        console.log(url);
        request(app)
          .post(url)
          .send({
            pushToken: mockDevice.pushToken
          })
          .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
          .expect('Content-Type', /json/)
          .expect(201, done);
      });

      it('POST - 401 - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - no auth register a new device for pass', (done) => {
        request(app)
          .post(`/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`)
          .send({
            pushToken: mockDevice.pushToken
          })
          .expect('Content-Type', /json/)
          .expect(401, done);
      });

      it('POST - 200 - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - return existing device for pass',(done) => {
          request(app)
            .post(`/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`)
            .send({
              pushToken: mockDevice.pushToken
            })
            .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
            .expect('Content-Type', /json/)
            .expect(200, done);
        });

      it('GET - 200 - /api/v1/devices/:device_id/push/:token - send push to device', function (done) {
        request(app)
          .get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/push/' + mockDevice.pushToken)
          .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
          .expect('Content-Type', /json/)
          .expect(200, done);
      });

      describe('Getting the Serial Numbers for Passes Associated with a Device', () => {
        it('GET - 200 - /api/v1/devices/:device_id/registrations/:pass_type_id - get serial numbers',
          function (done) {
            request(app)
              .get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' +
                mockPass.passTypeIdentifier)
              .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
              .expect('Content-Type', /json/)
              .expect(200, done);
          });

        it('GET - 200 - /api/v1/devices/:device_id/registrations/:pass_type_id?passesUpdatedSince=tag - get passesUpdatedSince serial numbers',
          function (done) {
            request(app)
              .get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' +
                mockPass.passTypeIdentifier +'?passesUpdatedSince=' + Date.now())
              .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
              .expect('Content-Type', /json/)
              .expect(200, done);
          });

        it('GET - 200 - /api/v1/devices/:device_id/:registrations/:pass_type_id', function (done) {
          var url = `/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}`;
          console.log(url);
          request(app)
            .get(url)
            .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
            .expect('Content-Type', /json/)
            .expect(function (res) {
              assert.ok(res.body.serialNumbers);
            })
            .expect(200, done);
        });

        it('GET - 404 - /api/v1/devices/:device_id/:registrations/:pass_type_id - no matching passes', function (done) {
          request(app)
            .get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/unknown')
            .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
            .expect(404, done);
        });

        it('DELETE - 200 - /api/v1/devices/:device_id/:pass_type_id/:serial_number - un-register device', function (done) {
          console.log('mockDevice', mockDevice);
          request(app)
            .delete(`/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`)
            // .expect('Content-Type', /json/)
            .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
            .expect('Content-Type', /json/)
            .expect(200, done);
        });
      });

      it('POST - 201 - /api/v1/log - should store logs', function (done) {
        request(app)
          .post('/api/v1/log')
          .send({
            logs: ['test log']
          })
          .expect('Content-Type', /json/)
          .expect(201, done);
      });


      describe('Passes', function () {

        it('GET - 401 - /api/v1/passes/:pass_type_id/:serial_number - 401', function (done) {
          request(app)
            .get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}111`)
            .expect(401, done);
        });

        it('GET - 200 - /api/v1/passes/:pass_type_id/:serial_number', function (done) {
          request(app)
            .get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`)
            .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
            //.expect('Content-Type', /application\/vnd.apple.pkpass/)
            .expect(200, done);
        });

        it('GET - 204 - /api/v1/passes/:pass_type_id/:serial_number - ?updated since date', function (done) {
          var prevTimestamp = Date.now();
          request(app)
            .get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}?updatedSince=${prevTimestamp}`)
            .set('Authorization', `ApplePass ${mockPass.authenticationToken}`)
            //.expect('Content-Type', /application\/vnd.apple.pkpass/)
            .expect(204, done);

        });
      });
    });
  });
});
