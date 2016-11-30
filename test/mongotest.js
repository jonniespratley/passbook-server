'use strict';
const glob = require('glob');
const co = require('co');
const fs = require('fs-extra');
const mongojs = require('mongojs');

// simple usage for a local db
var db = mongojs('localhost/passbook-server');

var passes = db.collection('passes');


var mockObj = {
  _id: 'user-jonnie',
  name: 'Jonnie',
  created: new Date()
};

// use the save function to just save a document (callback is optional for all writes)


var doc;
glob('test/temp/file-db/*.json', (err, files)=>{
  console.log('Glob', err, files);
  files.forEach((file) =>{
    doc = fs.readJsonSync(file);
    passes.save(doc, function(err, resp){
      console.log('resp', err, resp);
    });
  });

});
