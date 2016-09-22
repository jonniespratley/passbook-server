/**
 * @author Jonnie Spratley
 * @created 09/22/16
 */
'use strict';
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

const config = require(path.resolve(__dirname, '../config.js'));
const port = process.env.PORT || config.server.port || 5002;
const host = process.env.VCAP_APP_HOST || process.env.IP || config.server.hostname || '127.0.0.1';

var program = require('./program')(config);
var logger = program.getLogger('server');



// configure Express
var app = express();


app.locals.program = program;
app.locals.config = config;
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);

program.app = app;

var middleware = [
	//path.resolve(__dirname, './routes/jps-middleware-auth'),
	//path.resolve(__dirname, './routes/jps-passbook-routes'),
	path.resolve(__dirname, './routes/devices'),
	path.resolve(__dirname, './routes/passes')
];

middleware.forEach(function(m) {
	logger('use middleware', m);
	require(m)(app);
});

app.listen(port, host, function() {
	logger('listening on', host + ':' + port);
});
