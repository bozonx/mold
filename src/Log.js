export default class Log {
  constructor(config) {
    this._isSilent = config.silent || true;
  }

  info () {
    if (!this._isSilent) console.log(arguments);
  }
}
