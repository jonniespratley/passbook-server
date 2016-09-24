'use strict';

const _ = require('lodash');
const assert = require('assert');
const utils = require('./utils');
const request = require('request');
const log = require('npmlog');

module.exports = function(url, options) {
	log.heading = 'couchdb';
	assert(url, 'must have base url')
	var logger = utils.getLogger('couchdb');
	const BASE_URL = url || 'http://localhost:4987/passbook-server';

	var defaultOptions = {
		baseUrl: BASE_URL,
		method: 'GET',
		json: true,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'x-token': 'my-token'
		}
	};
	options = _.extend(defaultOptions, options);

	if (options.debug) {
		//////request.debug = true;
	}


	var baseRequest = request.defaults(options);
	var sendRequest = function(options) {
		log.http(options.method, options.url);
		return new Promise(function(resolve, reject) {
			baseRequest(options, function(err, resp, body) {
				if (!err) {
					log.http(resp.statusCode, options.url);
					resp.data = body;
					resolve(resp.data);
				} else {
					log.error(options.url, err);
					reject(err);
				}
			});
		});
	};

	var api = {
		get: function(id) {
			log.http('get', id);
			return new Promise(function(resolve, reject) {
				sendRequest({
					method: 'GET',
					url: `${id}`
				}).then((resp) => {
					resolve(resp);
				}, reject);
			});
		},
		remove: function(id, rev) {
			return new Promise((resolve, reject) => {
				log.http('remove', id);

				if (!rev) {
					this.get(id).then((resp) => {
						let oldDoc = resp;
						sendRequest({
							url: `${oldDoc._id}?rev=${oldDoc._rev}`,
							method: 'DELETE'
						}).then(resolve).catch(reject);
					}).catch(reject);
				} else {
					sendRequest({
						url: `${id}?rev=${rev}`,
						method: 'DELETE'
					}).then(resolve).catch(reject);
				}
			});
		},
		put: function(doc) {
			log.info('put', doc._id, doc._rev);
			return new Promise(function(resolve, reject) {
				if (!doc._rev) {
					api.get(doc._id).then(function(resp) {
						log.info('put', doc._id, resp._rev);
						doc._rev = resp._rev;
						sendRequest({
							url: `${doc._id}?rev=${doc._rev}`,
							headers: {
								'If-Match': doc._rev
							},
							method: 'PUT',
							json: true,
							body: doc
						}).then((_doc) => {
							doc._rev = _doc.rev;
							resolve(doc);
						}, reject);

					}).catch(function(err) {
                        log.error('creating document', doc._id);
						sendRequest({
							url: `${doc._id}`,
							method: 'PUT',
							json: true,
							body: doc
						}).then(resolve, reject);
					});
				}
			});
		},
		saveAll: function(docs) {
			return new Promise((resolve, reject) => {
				let _saves = [];
				docs.forEach((doc) => {
					log.info('save', doc);
					_saves.push(this.put(doc));
				});
				Promise.all(_saves).then(resolve, reject);

				/*
				sendRequest({
					url: `/_bulk_docs`,
					method: 'PUT',
					json: true,
					body: {
						docs: docs
					}
				}).then(resolve, reject);*/
			});
		},
		post: function(doc) {

			return new Promise(function(resolve, reject) {
				if(!doc._id){
					doc._id = require('node-uuid').v4();
				}
				sendRequest({
					url: `${doc._id}`,
					method: 'POST',
					json: true,
					body: doc
				}).then(resolve, reject);
			});
		},
		find: function(params) {
			return this.allDocs(params);
		},
		allDocs: function(params) {
			return new Promise(function(resolve, reject) {
				sendRequest({
					url: '_all_docs?include_docs=true',
					method: 'GET'
				}).then(function(resp) {
					var docs = resp.rows.filter(function(row) {
						return row.doc;
					});
					log.info('allDocs', docs.length);
					resolve({
						rows: docs
					});
				}, reject);
			});
		}
	};

	api.bulkDocs = api.saveAll;

	return api;
};
