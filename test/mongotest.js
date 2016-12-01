'use strict';
const glob = require('glob');
const co = require('co');
const fs = require('fs-extra');
const mongojs = require('mongojs');

// simple usage for a local db
var endpoint = 'localhost/passbook-server';


//var db = mongojs('localhost/passbook-server');
//var passes = db.collection('passes');


var mockObj = {
  _id: 'user-jonnie',
  name: 'Jonnie',
  created: new Date()
};

// use the save function to just save a document (callback is optional for all writes)

class MongoDbAdapter{
  constructor(name, config){
    this.name = name;
    this.config = config;
    this.db = mongojs(config.url);
    this.collection = this.db.collection(name);
  }

  allDocs(params){
    return this.find(params);
  }

  find(params){
    return new Promise((resolve, reject) =>{
      this.collection.find(params, (err, docs)=>{
        if(err){
          reject(err);
        }
        resolve(docs);
      });
    });
  }
  get(params){
    return new Promise((resolve, reject) =>{
      this.collection.findOne(params, (err, docs)=>{
        if(err){
          reject(err);
        }
        resolve(docs);
      });
    });
  }

  post(doc){
    return this.put(doc);
  }

  put(doc){
    return new Promise((resolve, reject) =>{
      this.collection.save(doc, function(err, resp){
        if(err){
          reject(err);
        }
        resolve(resp);
      });
    });
  }

  remove(doc){
    return new Promise((resolve, reject) =>{
      this.collection.remove(doc, function(err, resp){
        if(err){
          reject(err);
        }
        resolve(resp);
      });
    });
  }

}




var db = new MongoDbAdapter('passes', {url: endpoint});

var doc;
glob(__dirname + '/temp/file-db/*.json', (err, files)=>{
  console.log('Glob', err, files);
  files.forEach((file) =>{
    doc = fs.readJsonSync(file);
    if(doc.docType === 'pass'){
      db.put(doc).then((res) =>{
        console.log('Result', res);
      });
    }
  });

});
