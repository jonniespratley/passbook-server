'use strict';
const gulp = require('gulp');

const gulpSequence = require('gulp-sequence');



const config = {
  src: [
    'src/**/*.js'
  ],
  specs: 'test/specs/**/*-spec.js'
};



const jsdoc = require('gulp-jsdoc3');
gulp.task('docs', function(cb) {
  gulp.src(['README.md', './src/**/*.js'], {
      read: false
    })
    .pipe(jsdoc(cb));
});


const coveralls = require('gulp-coveralls');
gulp.task('coveralls', function() {
  return gulp.src('./coverage/lcov.info')
    .pipe(coveralls());
});

const istanbul = require('gulp-istanbul');
gulp.task('pre-test', function() {
  return gulp.src(config.src)
    .pipe(istanbul({
      includeUntested: true,
    }))
    .pipe(istanbul.hookRequire());
});

const mocha = require('gulp-mocha');
gulp.task('test', ['pre-test'], function() {
  return gulp.src(config.specs)
    .pipe(mocha({
      read: false,
      reporter: 'mochawesome'
    }))
    .pipe(istanbul.writeReports())
    .once('error', function() {
      process.exit(1);
    })
    .once('end', function() {
      process.exit();
    });
});
const spawnMocha = require('gulp-spawn-mocha');
gulp.task('spawn-mocha', function() {
  return gulp.src(config.specs)
    .pipe(spawnMocha({
      read: false,
      reporter: 'mochawesome',
      istanbul: true,
      env: {
        'PASSBOOK_SERVER_TEAM_IDENTIFIER': 'USE9YUYDFH',
        'PASSBOOK_SERVER_PASS_TYPE_IDENTIFIER': 'pass.io.passbookmanager.test',
        'PASSBOOK_SERVER_WEB_SERVICE_URL': 'https://passbook-server.run.aws-usw02-pr.ice.predix.io/api'
      }
    }))
  //  .pipe(istanbul.writeReports())
    .once('error', function() {
      process.exit(1);
    })
    .once('end', function() {
      process.exit();
    });
});

gulp.task('watch', function() {
  gulp.watch(['src/**', 'test/specs/**'], ['test']);
});


gulp.task('default', gulpSequence('test', 'coveralls'));
