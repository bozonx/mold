/*jshint node: true*/
var path = require('path');
var _ = require('lodash');
var webpackConfig = require('./webpack.config.js');
var RewirePlugin = require("rewire-webpack");

wpConf = _.assign(_.cloneDeep(webpackConfig), {
    // clear entry. It's not need there.
    entry: {},

    cache: false,

    // karma watches the test entry points
    // (you don't need to specify the entry option)
    // webpack watches dependencies

    // webpack configuration
    devtool: 'inline-source-map',
});
wpConf.plugins = [].concat(webpackConfig.plugins);
wpConf.plugins.push(new RewirePlugin());


// Karma configuration
module.exports = function (config) {
    'use strict';
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        frameworks: ['mocha', 'chai'],
        // start these browsers
        browsers: ['PhantomJS'],
        // test results reporter to use
        reporters: ['mocha'],

        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // list of files / patterns to load in the browser
        files: [
            //'node_modules/babel-core/browser-polyfill.js',
            //'test/test_main.coffee',
            //'test/test_main.js',
            //'test/**_spec.coffee',
            //'dist/app_entry_build.js',
            'test/test_main.coffee',
        ],
        // list of files to exclude
        exclude: [],

        preprocessors: {
            //'test/entry.js': ['webpack', 'sourcemap'],
            //'**/*_spec.coffee': ['webpack', 'sourcemap'],
            'test/test_main.coffee': ['webpack', 'sourcemap'],
        },
        webpack: wpConf,
        webpackMiddleware: {
            noInfo: true
        },
        phantomjsLauncher: {
          // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
          exitOnResourceError: true
        },

        plugins: [
          //require("karma-webpack"),
          'karma-webpack',
          'karma-mocha-reporter',
          'karma-mocha',
          'karma-chai',
          'karma-phantomjs-launcher',
          'karma-sourcemap-loader',
        ],

    });
};
