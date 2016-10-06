'use strict';
const assert = require('assert');
const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash");
const log = require("npmlog");
const request = require("request");
const npmlog = require('npmlog');
const PouchDB = require('PouchDB');



const BASE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io';
const REMOTE_BASE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io';
const config = require('./test-config');
const Chance = require('chance');
const chance = new Chance();
var remoteDb;

const baseRequest = request.defaults({
	method: 'GET',
	baseUrl: BASE_URL
});

function $http(options) {
	return new Promise(function(resolve, reject) {
		baseRequest(options, function(err, resp, body) {
			if (err) {
				reject(err);
			}
			resolve(body);
		});
	});
}

var data = null;



//Sync from local to remote

const db = {
	username: process.env.PASSBOOK_SERVER_DB_USERNAME || 'admin',
	password: process.env.PASSBOOK_SERVER_DB_PASSWORD || 'fred'
};
const database = new PouchDB(
	`https://${db.username}:${db.password}@pouchdb.run.aws-usw02-pr.ice.predix.io/passbook-server`);
const passbook = require('passbook-cli');
const tempDir = path.resolve(__dirname, './temp');
var certs = {
	p12: path.resolve(__dirname, '../node_modules/passbook-cli/src/certificates/pass.io.passbookmanager.test.p12'),
	passphrase: 'test'
};


var rawPasses = [];

//Create certs
passbook.createPemFiles(certs.p12, certs.passphrase, tempDir).then((resp) => {
	console.log('pems', resp);
	certs.key = resp.key.filename;
	certs.cert = resp.cert.filename;
});

//Save all passes to passbook-server.
const localdb = new PouchDB(path.resolve(__dirname, '../db'));


var saveDocAttachment = (doc, filename) => {
	return new Promise((resolve, reject) => {
		localdb.get(doc._id).then((existingDoc) => {
			doc._rev = existingDoc._rev;

			localdb.putAttachment(doc._id,
				`${doc._id}.pkpass`,
				existingDoc._rev,
				fs.readFileSync(filename), 'application/pkpass',
				function(err, res) {
					log.error('putAttachment', err);
					if (err) {
						reject(err);
					}
					resolve(res);
				});
		}).catch((err) => {
			//db.put(doc).then(resolve, reject);
			reject(err);
		});
	});
};


function saveDocToPassbookServer(doc) {
	log.info('saveDocToPassbookServer', doc._id);

	return localdb.get(doc._id).then((existingDoc) => {
		log.info('saving', existingDoc._id);
		doc._rev = existingDoc._rev;
		return localdb.put(doc);
	}).catch((err) => {
		delete doc._rev;
		return localdb.put(doc);
	});

	/*return $http({
		baseUrl: 'http://localhost:5353',
		url: `/api/v1/admin/db/${doc._id}?rev=${doc._rev}`,
		body: doc,
		json: true,
		method: 'PUT'
	});*/

}



var index = 0;

function getRemotePassesAndAddLocal() {

	//Get all docs
	database.allDocs({
		include_docs: true,
		limit: 150
	}).then((resp) => {
		log.info('creating ', resp.rows.length, 'passes');
		_.forEach(resp.rows, (row) => {
			let doc = row.doc;
			if (doc.docType === 'pass') {
				index++;

				doc.teamIdentifier = config.teamIdentifier;
				doc.webServiceURL = config.webServiceURL;
				doc.passTypeIdentifier = config.passTypeIdentifier;
				doc.authenticationToken = chance.guid();
				doc.lastUpdated = chance.timestamp();
				doc.logoText = `Pass ${index}`;
				doc.organizationName = `Pass ${index}`;

				//TODO Create .raw
				passbook.createPassAssets({
					name: doc._id,
					type: doc.type,
					output: './temp',
					pass: doc
				}).then((out) => {

					doc.rawpassFilename = out;
					rawPasses.push(out);
					log.info('raw', out);

					assert(fs.existsSync(out), 'returns .raw filename');


					//TODO 1 - Create .pkpass
					passbook.createPkPass(out, certs.cert, certs.key, certs.passphrase).then((pkpass) => {
						log.info('pkpass', pkpass);
						doc.pkpassFilename = pkpass;
						assert(fs.existsSync(pkpass), 'return .pkpass filename');

						//TODO - 2 Save pass to server
						saveDocToPassbookServer(doc).then((res) => {
							log.info('saved', res);
							//fs.removeSync(doc.rawpassFilename);
							fs.removeSync(doc.rawpassFilename.replace('.raw', '.zip'));
							saveDocAttachment(doc, doc.pkpassFilename).then((d) => {
								log.info('done', d);
							})
						}).catch((err) => {
							log.error('saved', err);
						});


					}).catch((err) => {
						assert.fail(err);
					});


				});
			} else {
				log.info('Not creating', doc);
			}
		});
	});
}



function removeDoc(doc) {
	log.info('remove', doc._id);
	return $http({
		baseUrl: REMOTE_BASE_URL,
		url: `/api/v1/admin/db/${doc._id}?rev=${doc._rev}`,
		method: 'DELETE'
	});
}

function cleanDocs(rows) {
	console.log('Cleaning', rows.length);
	return new Promise((resolve, reject) => {
		var _docs = [];
		var _done = _.after(rows.length, function() {
			console.log('done cleaning');
			Promise.all(_docs).then(resolve, reject);
		});
		_.forEach(rows, function(row) {
			removeDoc(row).then((resp) => {
				console.log('cleaned', resp);
				_done();
			});
		});
	});
}
//request.debug = true;
$http({
	baseUrl: REMOTE_BASE_URL,
	json: true,
	url: '/api/v1/admin/db',
	qs: {
		docType: 'log'
	}
}).then(cleanDocs).then((resp) => {
	log.info('resp', resp);
}).catch((err) => {
	log.error(err);
});
