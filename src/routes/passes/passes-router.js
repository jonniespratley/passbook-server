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
    app.get(`/api/${config.version}`, function(req, res){
        res.status(200).json({
            message: 'welcome'
        });
    });
    adminRouter.get('/', function(req, res){
        res.status(200).json({
            message: 'welcome'
        });
    });
    adminRouter.get('/passes', passController.get_all_passes);
    adminRouter.get('/passes/:id?', passController.get_pass);
    adminRouter.put('/passes/:id', jsonParser, passController.put_pass);
    adminRouter.post('/passes', jsonParser, passController.post_pass);
    adminRouter.delete('/passes/:id', passController.delete_pass);





    	//Logging Endpoint
    	app.post( '/log', jsonParser, function(req, res) {

    		var data = {
    			body : JSON.stringify(req.body),
    			params : req.params,
    			url : req.path,
    			_id : 'log-' + Date.now().toString(),
    			type: 'log',
    			time : Date.now().toString()
    		};
    	program.db.put(data).then(function(msg) {
    			res.status(200).send(msg);
    		}, function(err) {
    			res.status(400).send(err);
    		});

    	});

    router.get('/:pass_type_id/:serial_number', passController.get_passes);


    app.use(prefix, router);
    app.use(adminPrefix, adminRouter);



    require('express-list-routes')({ prefix: prefix }, 'API:', router );
    require('express-list-routes')({ prefix: adminPrefix }, 'API:', adminRouter );

	return router;
};
