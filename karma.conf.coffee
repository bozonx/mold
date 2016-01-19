# jshint node: true

# see config options in http://karma-runner.github.io/0.13/config/configuration-file.html

path = require('path')
_ = require('lodash')
appWebpackConfig = require('./webpack.config.js')
RewirePlugin = require("rewire-webpack")

wpConf = {
  cache: false,
  devtool: 'inline-source-map',
  resolve: {
    root: [
      #'lib',
      'bower_components',
    ],
  },

}
# take loaders conf from app wp config
wpConf.module = appWebpackConfig.module
# take plugins from app wp config
wpConf.plugins = [].concat(appWebpackConfig.plugins)
wpConf.plugins.push(new RewirePlugin())

# Karma configuration
module.exports = (config) ->
  config.set
    # base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    frameworks: ['mocha', 'chai'],
    browsers: ['PhantomJS'],
    reporters: ['mocha'],
    #reporters: ['mocha', 'coverage'],
    port: 9876,
    colors: true,
    # level of logging
    # possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    # Continuous Integration mode
    # if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    # list of files / patterns to load in the browser
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'test/test_main.coffee',
      'test/**_spec.coffee',
    ],
    # list of files to exclude
    exclude: [],

    preprocessors: {
      'test/test_main.coffee': ['webpack', 'sourcemap'],
      'test/**_spec.coffee': ['webpack', 'sourcemap'],
    },
    webpack: wpConf,
    webpackMiddleware: {
      noInfo: true
    },
    phantomjsLauncher: {
      # Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
    },
