var path = require('path');



//TODO - Change to your values
const APPLE_TEAM_IDENTIFIER = 'USE9YUYDFH';
const APPLE_PASS_TYPE_IDENTIFIER = 'pass.io.passbookmanager.test';
const APPLE_WEB_SERVICE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io/api';
const APPLE_WWDR = path.resolve(__dirname, '../../src/certificates/wwdr-authority.pem');





const GITHUB_PRODUCTION_CLIENT_ID = '96943ce4c9b4f09bf98f';
const GITHUB_PRODUCTION_CLIENT_SECRET = 'f9809160c20f1f57876924c015aa68283f1c4a4b';
const GITHUB_PRODUCTION_CALLBACK_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io/auth/provider/callback';

const GITHUB_DEV_CLIENT_ID = '7171ef010ffc067de767';
const GITHUB_DEV_CLIENT_SECRET = '387c9cd85b4c48abcaa7547bf2865aaf922e4ac2';
const GITHUB_DEV_CALLBACK_URL = 'http://127.0.0.1:5001/auth/provider/callback';

var GITHUB_CLIENT_ID = GITHUB_DEV_CLIENT_ID;
var GITHUB_CLIENT_SECRET = GITHUB_DEV_CLIENT_SECRET;

var GITHUB_CALLBACK_URL = '/auth/provider/callback';
module.exports = {
	debug: true,
	baseUrl: '/api',
	name: 'passbook-server',
	"message": "passbook-server api",
	"version": "v1",
	"teamIdentifier": APPLE_TEAM_IDENTIFIER,
	"passTypeIdentifier":APPLE_PASS_TYPE_IDENTIFIER,
	"webServiceURL": APPLE_WEB_SERVICE_URL,
	security: {
		salt: 'a58e325c6df628d07a18b673a3420986'
	},
	"middleware": ["./routes/admin", "./routes/logs", "./routes/devices", "./routes/passes"],
	"publicDir": "./public",
	"database": {
    "username": "admin",
    "password": "fred",
		"name": "passbook-server",
		"local": "passbook-server",
		"url": "http://localhost:4987/passbook-server",
		"path": "./temp/db"
	}
};
