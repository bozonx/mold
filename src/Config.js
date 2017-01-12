import _ from 'lodash';

const defaultConfig = {
  silent: false,
  eventEmitter: null,
  logger: null,
  itemsPerPage: 10,
  omitParamsToRequest: ['$index', '$pageIndex', '$addedUnsaved', '$deleting', '$deleted', '$saving'],
};


export default class Config {
  constructor(conf) {
    this._rawConfig = conf;

    this._config = _.defaultsDeep(_.cloneDeep(this._rawConfig), this.getDefaults());

    this._initModules();
  }

  get() {
    return this._config;
  }

  getDefaults() {
    return _.clone(defaultConfig);
  }

  _initModules() {
    if (!this._config.eventEmitter) {
      this._config.eventEmitter = require('./events').default;
    }
    if (!this._config.logger) {
      const Log = require('./Log').default;
      this._config.logger = new Log({silent: this._config.silent});
    }
  }
}
