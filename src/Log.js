import _ from 'lodash';

export default class Log {
  constructor(config) {
    this._isSilent = (_.isBoolean(config.silent)) ? config.silent : true;
  }

  info() {
    if (!this._isSilent) console.log(...arguments);
  }

  error() {
    if (!this._isSilent) console.error(...arguments);
  }

  fatal() {
    if (!this._isSilent) throw new Error(...arguments);
  }
}
