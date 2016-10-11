'use strict';
const assert = require('assert');
const path = require('path');
const request = require('supertest');
const express = require('express');

var app;
var instance;

// TODO: Program
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program;
var Admin = require(path.resolve(__dirname, '../../src/routes/admin'));

/*global describe, it, before*/
describe('Admin Module', function() {
  var testDoc = {
    title: 'testdoc',
    docType: 'test'
  };
  before(function(done) {
    program = mocks.program();
    app = express();
    app.locals.program = program;
    app.locals.db = program.db;
    instance = new Admin(app);

    program.db.bulkDocs([
      {docType: 'test'},
      {docType: 'test'}
    ]).then((res)=>{
      done();
    });

  });


  it('GET - /api/v1/admin/db - should return all docs', function(done) {
    request(app)
      .get(`/api/v1/admin/db`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res)=>{
        testDoc = res.body[0];
        done();
      });
  });

  it('POST - /api/v1/admin/db - should create doc', function(done) {
    request(app)
      .post(`/api/v1/admin/db`)
      .send({
        title: 'new doc',
        docType: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(201, done);

  });


  it('PUT - /api/v1/admin/db - should update doc', function(done) {
    request(app)
      .put(`/api/v1/admin/db/${testDoc._id}?rev=${testDoc._rev}`)
      .send(testDoc)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res)=>{
        assert(res.body.ok, 'returns ok');
        testDoc._id = res.body.id;
        testDoc._rev = res.body.rev;
        console.log(res.body);
        done();
      });
  });

  it('DELETE - /api/v1/admin/db - should remove doc', function(done) {
    request(app)
      .del(`/api/v1/admin/db/${testDoc._id}?rev=${testDoc._rev}`)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
