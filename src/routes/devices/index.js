'use strict';
module.exports = function(app){
    var program = app.locals.program;
    require('./devices-router')(program, app);
};
