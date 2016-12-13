import _ from 'lodash';

export default class Config {
  constructor(conf) {
    this._rawConfig = conf;

    this._config = _.defaultsDeep(_.cloneDeep(this._rawConfig), this.getDefaults());

    // TODO: validate a config
  }

  get() {
    return this._config;
  }

  getDefaults() {
    return {
      silent: false,
      eventEmitter: null,
      logger: null,
    }
  }
}
