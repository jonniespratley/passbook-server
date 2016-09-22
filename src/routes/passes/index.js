'use strict';
module.exports = function(app){
    var program = app.locals.program;
    require('./passes-router')(program, app);
};
