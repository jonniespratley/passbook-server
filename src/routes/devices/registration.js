'use strict';
const _ = require('lodash');

class Registration {
  constructor(obj){
    obj = obj || {};
    var device_id = obj.device_id;
    var pass_id = obj.pass_id;
    var id = `registration-${device_id}`;
    _.assign(this, {
      _id: id,
      docType: 'registration',
      device_id: device_id,
      pass_id: pass_id,
      //auth_token: null,
     // push_token: null,
      created: _.now(),
      updated: _.now()
    }, obj);
    return this;
  }
}
module.exports = Registration;
