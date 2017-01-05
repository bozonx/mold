import _ from 'lodash';

import Storage from './Storage';
import SchemaManager from './SchemaManager';
import State from './State';
import Config from './Config';

export default class Main {
  constructor(config, schema) {
    const configInstance = new Config(config);
    this.$$config = configInstance.get();
    this.$$events = this.$$config.eventEmitter;
    this.$$log = this.$$config.logger;
    this.$$schemaManager = new SchemaManager();
    this.$$state = new State();

    this.$$storage = new Storage(this.$$events);

    // initialize
    this.$$schemaManager.init(schema, this);
    this.$$state.init(this, this.$$storage);
  }

  /**
   * Get real storage. Use it only for binding to frameworks.
   * For other ways use exportStorage.
   * @returns {*}
   */
  $getWholeStorageState() {
    return this.$$storage.$getWholeStorageState();
  }

  /**
   * Export storage
   * @returns {*}
   */
  exportStorage() {
    return _.cloneDeep(this.$$storage.$getWholeStorageState());
  }

  /**
   * Get instance of one of the types by a path
   * @param {string} path - absolute path
   * @returns {object} - instance of one of the types
   */
  child(path) {
    return this.$$schemaManager.getInstance(path);
  }

  onAnyUpdate(handler) {
    this.$$state.onAnyUpdate(handler);
  }

  offAnyUpdate(handler) {
    this.$$state.offAnyUpdate(handler);
  }
}
