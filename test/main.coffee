# main file for tests

path = require('path');
#require('app-module-path').addPath(path.resolve(path.join(__dirname, '../')));

chai = require('chai')
chai.use(require('sinon-chai'));
require('mocha-sinon');
global.assert = chai.assert
global.expect = chai.expect
