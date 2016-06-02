var gulp = require('gulp');
var Server = require('karma').Server;
var sh = require('shelljs');

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  function forceStop () {
    done();
    sh.exit(0);
  }
  new Server({
    configFile: __dirname + '/karma.conf.coffee',
    //autoWatch: false,
    singleRun: true
  }, forceStop).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.coffee',
    autoWatch: true,
    singleRun: false,
  }, done).start();
});
