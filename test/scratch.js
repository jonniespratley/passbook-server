'use strict';

const _ = require("lodash");
const log = require("npmlog");
const request = require("request");
request.debug = true;

var data = null;

const npmlog = require('npmlog');
const PouchDB = require('PouchDB');

//Sync from local to remote
var localDb;



const BASE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io';

var remoteDb;

const baseRequest = request.defaults({
	method: 'GET',
	baseUrl: BASE_URL,
  json: true
});

function $http(options) {
  return new Promise(function (resolve, reject) {
    baseRequest(options, function (err, resp, body) {
      if(err){
        reject(err);
      }
      resolve(body);
    });
  });
}


function removeDoc(id, rev) {
	log.info('remove', id, rev);
  return $http({
    url: `/api/v1/admin/db/${id}`,
    method: 'DELETE'
  });
}

function cleanDocs(rows) {
  console.log('Cleaning', rows.length);
	return new Promise((resolve, reject) =>{
    var _docs = [];
  	var _done = _.after(rows.length, function() {
  		console.log('done cleaning');
  		Promise.all(_docs).then(resolve, reject);
  	});
  	_.forEach(rows, function(row) {
  		_docs.push(removeDoc(row._id));
  		_done();
  	});
  });
}

$http({url: '/api/v1/admin/db'}).then(cleanDocs).then((resp) =>{
  log.info('resp', resp);
}).catch((err) =>{
  log.error(err);
});
