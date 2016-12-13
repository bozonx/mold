export default class Config {
  constructor(conf) {
    this._config = conf;

    // TODO: validate a config
  }

  get() {
    return this._config;
  }
}
