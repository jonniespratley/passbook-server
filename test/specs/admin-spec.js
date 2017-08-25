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
    program = mocks.main().program;
    app = express();
    app.locals.program = program;
    app.locals.db = program.get('db');
    instance = new Admin(app);

    program.db.bulkDocs(mocks.getMockPasses(5)).then((res)=>{
      done();
    }).catch(done);

  });


  xit('GET - /_admin - should index', function(done) {
    request(app)
      .get(`/_admin`)
      //.set('Accept', 'text/html')
      //.expect('Content-Type', /html/)
      .expect(200, done);
  });
  it('GET - /_admin/db - should return all docs', function(done) {
    request(app)
      .get(`/_admin/db`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res)=>{
        testDoc = res.body[0];
        done();
      });
  });

  it('GET - /_admin/db - should return all docs by params', function(done) {
    request(app)
      .get(`/_admin/db?docType=test`)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('GET - /_admin/db/:id - should return 1 doc', function(done) {
    request(app)
      .get(`/_admin/db/${testDoc._id}`)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  it('GET - /_admin/db/unknown - should return 404', function(done) {
    request(app)
      .get(`/_admin/db/unknown`)
      .expect('Content-Type', /json/)
      .expect(404, done);
  });

  it('POST - /_admin/db - should create doc', function(done) {
    request(app)
      .post(`/_admin/db`)
      .send({
        title: 'new doc',
        docType: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(201, done);

  });


  it('PUT - /_admin/db - should update doc', function(done) {
    request(app)
      .put(`/_admin/db/${testDoc._id}?rev=${testDoc._rev}`)
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

  it('DELETE - /_admin/db - should remove doc', function(done) {
    request(app)
      .del(`/_admin/db/${testDoc._id}?rev=${testDoc._rev}`)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
