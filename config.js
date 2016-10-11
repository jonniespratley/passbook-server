'use strict';
const path = require('path');
const pkg = require('./package.json');

//TODO - Change to your values
const APPLE_TEAM_IDENTIFIER = 'USE9YUYDFH';
const APPLE_PASS_TYPE_IDENTIFIER = 'pass.io.passbookmanager.test';
const APPLE_WWDR = path.resolve(__dirname, './certificates/wwdr-authority.pem');
const APPLE_WEB_SERVICE_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io/api';

const db = {
  username: process.env.PASSBOOK_SERVER_DATABASE_USERNAME || 'admin',
  password: process.env.PASSBOOK_SERVER_DATABASE_PASSWORD || 'fred'
};

const GITHUB_PRODUCTION_CLIENT_ID = '96943ce4c9b4f09bf98f';
const GITHUB_PRODUCTION_CLIENT_SECRET = 'f9809160c20f1f57876924c015aa68283f1c4a4b';
const GITHUB_PRODUCTION_CALLBACK_URL = 'https://passbook-server.run.aws-usw02-pr.ice.predix.io/auth/provider/callback';

const GITHUB_DEV_CLIENT_ID = '7171ef010ffc067de767';
const GITHUB_DEV_CLIENT_SECRET = '387c9cd85b4c48abcaa7547bf2865aaf922e4ac2';
const GITHUB_DEV_CALLBACK_URL = 'http://127.0.0.1:5353/auth/provider/callback';

const GITHUB_CLIENT_ID = GITHUB_DEV_CLIENT_ID;
const GITHUB_CLIENT_SECRET = GITHUB_DEV_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = '/auth/provider/callback';

var config = {
  "name": "passbook-server",
  "debug": true,
  "baseUrl": "/api",
  "message": "passbook-server api",
  "version": "v1",
  "teamIdentifier": APPLE_TEAM_IDENTIFIER,
  "passTypeIdentifier": APPLE_PASS_TYPE_IDENTIFIER,
  "webServiceURL": APPLE_WEB_SERVICE_URL,
  "session": {
    "user": {
      "username": "jonniespratley"
    }
  },
  "database": {
    "name": "passbook-server",
    "username": "admin",
    "password": "fred",
    //"url": `https://admin:fred@pouchdb.run.aws-usw02-pr.ice.predix.io/passbook-server`,
    "url": process.env.PASSBOOK_SERVER_DATABASE_URL || "http://admin:fred@localhost:4987/passbook-server",
    "path": path.resolve(require('user-home'), './.passbook-server/db')
  },
  "passport": {
    "development": {
      "github": {
        "clientID": GITHUB_DEV_CLIENT_ID,
        "clientSecret": GITHUB_DEV_CLIENT_SECRET,
        "callbackURL": GITHUB_DEV_CALLBACK_URL
      }
    },
    "production": {
      "github": {
        "clientID": GITHUB_PRODUCTION_CLIENT_ID,
        "clientSecret": GITHUB_PRODUCTION_CLIENT_SECRET,
        "callbackURL": GITHUB_PRODUCTION_CALLBACK_URL
      }
    }
  },
  "security": {
    "salt": "a58e325c6df628d07a18b673a3420986"
  },
  "server": {
    "host": "127.0.0.1",
    "port": 5001
  },
  "middleware": ["./routes/admin", "./routes/logs", "./routes/devices", "./routes/passes"],
  "publicDir": "./public"
};

module.exports = config;
