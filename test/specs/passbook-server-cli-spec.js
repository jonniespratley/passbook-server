'use strict';
const pshell = require('pshell');
var assert = require('assert');
var path = require('path');
var bin = path.join(__dirname, '../../bin/passbook-server');


function getCmd(cmd) {
    var out = `node ${bin} ${cmd}`;
    console.log('$', out);
    return out;
}

function execCmd(cmd) {
    return pshell(getCmd(cmd));
}



/*global describe, it*/
describe('passbook-server bin', function () {

    xit('should print node version', function (done) {
        pshell('node --version', {
            echoCommand: true
        }).then((res) => {

            assert(res.code);
            assert(res);
            done();
        });
    });

    xit('should reject on exit', function (done) {

        // Using double quotes here is intentional. Windows shell supports double quotes only.
        pshell('node -e "process.exit(1)"').then(res => {
            console.log('exit code:', res.code);
        }).catch((err) => {
            console.error('error occurred:', err.message);
            assert(err);
            assert(err.message, 'returns message');

            done();
        });
    });

    xit('--help should run without errors', function (done) {
        execCmd('--help').then((res) => {
            assert(res);
            done();
        }).catch((error) => {
            assert.fail(error);
            done();
        });
    });

    it('--version should run without errors', function (done) {
        execCmd('--version').then((res) => {
            assert(res);
            done();
        }).catch((error) => {
            assert.fail(error);
            done();
        });
    });

    it('should return error on missing command', function (done) {
        this.timeout(4000);

        execCmd('--').then((res) => {
            assert.fail(res);
            done();
        }).catch((error) => {
            assert(error);
            done();
        });
    });

    it('should return error on unknown command', function (done) {
        this.timeout(4000);
        execCmd('junk').then((res) => {
            assert.fail(res);
            done();
        }).catch((error) => {
            assert(error);
            done();
        });
    });



});
