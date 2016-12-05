'use strict';

const mongojs = require('mongojs');

class MongoDbAdapter{
  constructor(name, config){
    this.name = name;
    this.config = config;
    var db = mongojs(config.url);
    this.db = db;
    this.collection = this.db.collection(name);
    db.on('error', function (err) {
      console.log('database error', err)
    })

    db.on('connect', function () {
      console.log('database connected')
    })

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
module.exports = MongoDbAdapter;
