import _ from 'lodash';

import Storage from './Storage';
import SchemaManager from './SchemaManager';
import State from './State';
import Config from './Config';
import Log from './Log';
import checkSchemaAndInitStore from './checkSchemaAndInitStore';

export default class Main {
  constructor(config, schema) {
    // TODO: наверное не стоит делать объекты открытыми - использовать геттер или $$

    var configInstance = new Config(config);
    this.config = configInstance.get();
    this.events = this.config.eventEmitter;
    this.log = new Log({silent: this.config.silent});

    this._storage = new Storage(this.events);
    this.schemaManager = new SchemaManager();
    this.state = new State();

    // initialize
    var {initialStorage, drivers} = checkSchemaAndInitStore(schema);
    this.schemaManager.init(schema, this);
    this.state.init(this, this._storage, initialStorage);
  }

  /**
   * Get real storage. Use it only for binding to react or other fremeworks.
   * For other ways use exportStorage.
   * @returns {*}
   */
  $getWholeStorageState() {
    return this._storage.$getWhoreStorageState();
  }

  /**
   * Export storage
   * @returns {*}
   */
  exportStorage() {
    return _.cloneDeep(this._storage.$getWhoreStorageState());
  }

  /**
   * Get instance of one of the types by a path
   * @param {string} path - absolute path
   * @returns {object} - instance of one of the types
   */
  instance(path) {
    return this.schemaManager.getInstance(path);
  }

  onMoldUpdate(handler) {
    this.state.onMoldUpdate(handler);
  }

  offMoldUpdate(handler) {
    this.state.offMoldUpdate(handler);
  }
}
