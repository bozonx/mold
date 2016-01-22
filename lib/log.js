//var _ = require('lodash');

//class Logger {
//  constructor () {
//  }
//
//  info (msg) {
//    console.info('INFO: ' + msg)
//  }
//
//  warn (msg) {
//    console.warn('WARNING: ' + msg)
//  }
//
//  error (msg) {
//    console.error('ERROR: ' + msg);
//  }
//
//  fatal () {
//    throw new Error(msg);
//  }
//}
//
//module.exports = new Logger();

module.exports = {
  error: function (msg) {
    console.error('ERROR: ' + msg);
  }
}
