var gulp = require('gulp');
var Server = require('karma').Server;

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    autoWatch: false,
    singleRun: true
  }, done).start();
});



//
//require('shared-lib/build/gulp_base')(gulp);
//require('shared-lib/build/gulp_test')(gulp);
//require('shared-lib/build/gulp_dev')(gulp);
//require('shared-lib/build/gulp_ionic')(gulp);
////require('libs-manage/gulp_libs')(gulp);
//require('../libs-manage/gulp_libs')(gulp);


//  "karma-jasmine": "~0.3.6",
//  "karma-mocha-reporter": "~1.1.1",
//"karma-webpack": "^1.7.0"
