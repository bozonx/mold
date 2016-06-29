# main file for tests
#require('source-map-support').install()

#path = require('path');
#require('app-module-path').addPath(path.resolve(path.join(__dirname, '../src')));

chai = require('chai')
sinon = require("sinon")
sinonChai = require('sinon-chai')
chai.use(sinonChai)
chai.use(require('chai-as-promised'))
require('mocha-sinon')

global.assert = chai.assert
global.expect = chai.expect
global.sinon = sinon

global._ = require('lodash')
