'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	jsonParser = bodyParser.json();

const PassController = require('./passes-controller');

module.exports = function(program, app) {
	var logger = program.getLogger('router:passes');
	var config = program.config.defaults;

    const prefix = `/api/${config.version}/passes`;
    const adminPrefix = `/api/${config.version}/admin`;

    var router = new Router();
	var passController = new PassController(program);
	var adminRouter = new Router();
    adminRouter.get('/passes', passController.get_all_passes);
    adminRouter.get('/passes/:id?', passController.get_pass);
    adminRouter.put('/passes/:id', jsonParser, passController.put_pass);
    adminRouter.post('/passes', jsonParser, passController.post_pass);
    adminRouter.delete('/passes/:id', passController.delete_pass);






    router.get('/:pass_type_id/:serial_number', passController.get_passes);


    app.use(prefix, router);
    app.use(adminPrefix, adminRouter);
    require('express-list-routes')({ prefix: prefix }, 'API:', router );
    require('express-list-routes')({ prefix: adminPrefix }, 'API:', adminRouter );

	return router;
};
