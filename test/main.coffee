# main file for tests
#require('source-map-support').install()

#path = require('path');
#require('app-module-path').addPath(path.resolve(path.join(__dirname, '../src')));

chai = require('chai')
chai.use(require('sinon-chai'));
require('mocha-sinon');
global.assert = chai.assert
global.expect = chai.expect

global._ = require('lodash');
