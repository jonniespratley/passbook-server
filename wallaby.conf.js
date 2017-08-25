'use strict';
module.exports = function() {
  process.env.NODE_ENV = 'development';
  return {
    files: [
      'src/**/*.js'
    ],

    tests: [
      'test/specs/**/*-spec.js'
    ],

    env: {
      type: 'node',
      params: {
        runner: '--harmony --harmony_arrow_functions'
      }
    }
  };
};
