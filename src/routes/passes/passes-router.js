'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    Router = express.Router,
    jsonParser = bodyParser.json();
const expressListRoutes = require('express-list-routes');
const PassController = require('./passes-controller');

module.exports = function (program, app) {
    var logger = program.getLogger('router:passes');
    var config = program.config.defaults;

    const prefix = `/api/${config.version}/passes`;
    const adminPrefix = `/api/${config.version}/admin`;
    const logPrefix = `/api/${config.version}/log`;

    var passController = new PassController(program);
    var router = new Router();

    var logRouter = new Router();
    var adminRouter = new Router();


    app.get(`/api/${config.version}`, function (req, res) {
        res.status(200).json({
            message: 'welcome'
        });
    });
    adminRouter.get('/', function (req, res) {
        res.status(200).json({
            message: 'welcome'
        });
    });
    adminRouter.get('/passes?', passController.get_all_passes);
    adminRouter.get('/passes/:id?', passController.get_pass);
    adminRouter.put('/passes/:id', jsonParser, passController.put_pass);
    adminRouter.post('/passes', jsonParser, passController.post_pass);
    adminRouter.delete('/passes/:id', passController.delete_pass);

    router.get('/:pass_type_id/:serial_number', passController.get_passes);


    //Logging Endpoint
    logRouter.post('/', jsonParser, passController.post_log);


    app.use(prefix, router);
    app.use(adminPrefix, adminRouter);
    app.use(logPrefix, logRouter);

    expressListRoutes({prefix: adminPrefix}, 'API:', adminRouter);
    expressListRoutes({prefix: logPrefix}, 'API:', logRouter);
    expressListRoutes({prefix: prefix}, 'API:', router);


    return router;
};
