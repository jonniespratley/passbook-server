'use strict';
const assert = require('assert');
const path = require('path');
const request = require('supertest');
const express = require('express');

var app;
var instance;

// TODO: Program
var mocks = require(path.resolve(__dirname, '../helpers/mocks.js'));
var program = mocks.program();
var Admin = require(path.resolve(__dirname, '../../src/routes/admin'));

/*global describe, it, before*/
describe('Admin Module', function() {
  before(function(done) {
    app = express();
    app.locals.program = program;
    app.locals.db = program.db;
    instance = new Admin(app);
    done();
  });

  it('POST - /api/v1/admin/db - should create doc', function(done) {
    request(app)
      .post(`/api/v1/admin/db`)
      .send({
        name: 'test-doc',
        docType: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(201, done);
  });

  it('PUT - /api/v1/admin/db - should update doc', function(done) {
    request(app)
      .post(`/api/v1/admin/db`)
      .send({
        name: 'test-doc',
        docType: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(201, done);
  });
});
