#!/usr/bin/env node
'use strict';
var meow = require('meow');
var passbookServer = require('./');

var cli = meow({
  help: [
    'Usage',
    '  passbook-server <input>',
    '',
    'Example',
    '  passbook-server Unicorn'
  ].join('\n')
});

passbookServer(cli.input[0]);
