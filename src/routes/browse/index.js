'use strict';
const express = require('express');

module.exports = function(app){
  const program = app.locals.program;
  const log =program.getLogger('browseRouter');
  // TODO: Extract
  var browseRouter = new express.Router();

  browseRouter.route('/_browse/:id?')
    .get(function(req, res) {
      var passes = [];

      if (req.params.id) {
        program.get('db').get(req.params.id).then((resp) => {
          log('/', resp._id);
          log('render', 'pass');
          res.render('pass', {
            title: 'Pass Details',
            pass: resp
          });
        }).catch((err) => {
          log.error('err', err);
          res.render('error', err);
        });
      } else {
        program.get('db').allDocs({
          docType: 'pass'
        }).then((resp) => {
          var doc;
          for (var i = 0; i < resp.rows.length; i++) {
            doc = resp.rows[i].doc;
            if (doc.webServiceURL) {
              passes.push(doc);
            }
          }
          log('Got passes', resp);
          res.render('browse', {
            title: 'All Passes',
            passes: passes
          });
        }).catch((err) => {
          log('err', err);
          res.render('500', err);
        });
      }
    });
    app.use('/', browseRouter);
};
