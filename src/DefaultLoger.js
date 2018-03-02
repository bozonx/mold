const _ = require('lodash');


module.exports = class DefaultLoger {
  constructor(config) {
    this._isSilent = (_.isBoolean(config.silent)) ? config.silent : true;
  }

  fatal(message) {
    throw new Error(`FATAL: ${message}`);
  }

  error(message) {
    if (!this._isSilent) console.error(`ERROR: ${message}`);
  }

  warn(message) {
    if (!this._isSilent) console.warn(message);
  }

  info(message) {
    if (!this._isSilent) console.info(message);
  }

  debug(message) {
    if (!this._isSilent) console.info(message);
  }

  verbose(message) {
    if (!this._isSilent) console.log(message);
  }
};
