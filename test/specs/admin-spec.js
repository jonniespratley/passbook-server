'use strict';
const assert = require('assert');
const path = require('path');
const request = require('supertest');
const express = require('express');

var app;
var instance;

// TODO: Program
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program();
var Admin = require(path.resolve(__dirname, '../../src/routes/admin'));
let testDoc = {
  name: 'test-doc',
  docType: 'test'
};
/*global describe, it, before*/
describe('Admin Module', function () {
  before(function (done) {
    app = express();
    app.locals.program = program;
    app.locals.db = program.db;
    instance = new Admin(app);
    done();
  });

  it('POST - /api/v1/admin/db - should create doc', function (done) {
    request(app)
      .post(`/api/v1/admin/db`)
      .send(testDoc)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) =>{
        assert(res.body.id);
        testDoc._id = res.body.id;
        assert(res.body.rev);
        console.log('post response', res.status);
        done();
      });
  });

  it('PUT - /api/v1/admin/db - should update doc', function (done) {
    request(app)
      .put(`/api/v1/admin/db/${testDoc._id}`)
      .send(testDoc)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) =>{
        assert(res.body.id, 'has id');
        assert(res.body.rev, 'has rev');
        done();
      });
  });
  it('GET - /api/v1/admin/db - should get doc', function (done) {
    request(app)
      .get(`/api/v1/admin/db/${testDoc._id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) =>{
        assert(res.body._id, 'has id');
        assert(res.body._rev, 'has rev');
        done();
      });
  });
  it('GET - /api/v1/admin/db - should get doc', function (done) {
    request(app)
      .delete(`/api/v1/admin/db/${testDoc._id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) =>{
        assert(res.body.ok, 'returns ok');

        done();
      });
  });
});
