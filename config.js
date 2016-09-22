'use strict';
const path = require('path');

//TODO - Change to your values
const APPLE_TEAM_IDENTIFIER = 'USE9YUYDFH';
const APPLE_PASS_TYPE_IDENTIFIER = 'pass.io.jsapps.walletmanager';
const APPLE_WWDR = path.resolve(__dirname, './certificates/wwdr-authority.pem');
const APPLE_PASS_TYPE_IDENTIFIER_CERT = path.resolve(__dirname, `./certs/${APPLE_PASS_TYPE_IDENTIFIER}-cert.pem`);
const APPLE_PASS_TYPE_IDENTIFIER_KEY = path.resolve(__dirname,
	`./certs/${APPLE_PASS_TYPE_IDENTIFIER}-key.pem`);

const APPLE_WEB_SERVICE_URL = 'https://passbook-manager.run.aws-usw02-pr.ice.predix.io/api';


const GITHUB_PRODUCTION_CLIENT_ID = '96943ce4c9b4f09bf98f';
const GITHUB_PRODUCTION_CLIENT_SECRET = 'f9809160c20f1f57876924c015aa68283f1c4a4b';
const GITHUB_PRODUCTION_CALLBACK_URL = 'https://passbook-manager.run.aws-usw02-pr.ice.predix.io/auth/provider/callback';

const GITHUB_DEV_CLIENT_ID = '7171ef010ffc067de767';
const GITHUB_DEV_CLIENT_SECRET = '387c9cd85b4c48abcaa7547bf2865aaf922e4ac2';
const GITHUB_DEV_CALLBACK_URL = 'http://127.0.0.1:5001/auth/provider/callback';

var GITHUB_CLIENT_ID = GITHUB_DEV_CLIENT_ID;
var GITHUB_CLIENT_SECRET = GITHUB_DEV_CLIENT_SECRET;

var GITHUB_CALLBACK_URL = '/auth/provider/callback';

var config = {
	"name": "pass-manager",
	debug: true,
	baseUrl: 'http://localhost:4987/passmanager',
	"message": "Pass Manager API Server",
	"dataPath": path.resolve(__dirname, "./data/"),
	redis: {
		hostname: '127.0.0.1',
		port: 6379
	},
	"version": "v1",
	session: {
		user: {
			username: 'jonniespratley'
		}
	},
	database: {
		name: 'passmanager',
		"dataPath": path.resolve(__dirname, "./data")
	},
	"passkit": {
		"version": "v1",
		"teamIdentifier": APPLE_TEAM_IDENTIFIER,
		"passTypeIdentifier": APPLE_PASS_TYPE_IDENTIFIER,
		"webServiceURL": APPLE_WEB_SERVICE_URL
	},
	passport: {
		development: {
			github: {
				clientID: GITHUB_DEV_CLIENT_ID,
				clientSecret: GITHUB_DEV_CLIENT_SECRET,
				callbackURL: GITHUB_DEV_CALLBACK_URL
			}
		},
		production: {
			github: {
				clientID: GITHUB_PRODUCTION_CLIENT_ID,
				clientSecret: GITHUB_PRODUCTION_CLIENT_SECRET,
				callbackURL: GITHUB_PRODUCTION_CALLBACK_URL
			}
		}
	},
	"security": {
		"salt": "a58e325c6df628d07a18b673a3420986"
	},
	"server": {
		"host": process.env.VCAP_APP_HOST || process.env.IP || "127.0.0.1",
		"port": process.env.PORT || 5001
	},
	"db": {
		"local": "passmanager",
		"remote": "http://localhost:4987/passmanager"
	},
	"collections": [
		"devices",
		"passes",
		"registrations",
		"notifications",
		"settings"
	],
	"staticDir": "./app",
	"publicDir": "./public"
};

module.exports = config;
