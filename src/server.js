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


var app = express();
app.locals.program = program;
app.locals.config = config;


program.app = app;

var middleware = [
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


const log = require('npmlog');
const debug = require('debug')('server');
class Server {
    constructor(middleware) {
        debug('Server', middleware);
        var app = express();
        this.app = app;
    }
    getExpressApp() {
        return this.app;
    }

    setExpressLocals(name, value) {
        debug('Server', 'setExpressLocals', name, value);
        this.app.locals[name] = value;
        return this.app;
    }

    startExpressServer(port, done) {
        this.app.listen(port, host, function(err) {
            log.info('listening on', host + ':' + port);

            done(err, this.app);
        });
    }
}


module.exports = Server;
