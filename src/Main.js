import _ from 'lodash';

import Storage from './Storage';
import SchemaManager from './SchemaManager';
import State from './State';
import Config from './Config';

import PagedCollection from './types/PagedCollection';
import Collection from './types/Collection';
import Container from './types/Container';
import Document from './types/Document';
import DocumentsCollection from './types/DocumentsCollection';

export default class Main {
  constructor(config, schema) {
    const configInstance = new Config(config);
    this.$$config = configInstance.get();
    this.$$events = this.$$config.eventEmitter;
    this.$$log = this.$$config.logger;
    this.$$schemaManager = new SchemaManager(this);
    this.$$state = new State();
    this._storage = new Storage(this.$$events, this.$$log);

    // register base types
    this.$$schemaManager.registerType('pagedCollection', PagedCollection);
    this.$$schemaManager.registerType('collection', Collection);
    this.$$schemaManager.registerType('container', Container);
    this.$$schemaManager.registerType('document', Document);
    this.$$schemaManager.registerType('documentsCollection', DocumentsCollection);

    // TODO: run plugins

    // initialize
    this.$$schemaManager.init(schema);
    this.$$state.init(this, this._storage);
  }

  /**
   * Get real storage. Use it only for binding to frameworks.
   * For other ways use exportStorage.
   * @returns {object}
   */
  $getWholeStorageState() {
    return this._storage.$getWholeStorageState();
  }

  /**
   * Set storage data. Only for test or dev purposes.
   * @param {object} newStorage
   */
  $setWholeStorageState(newStorage) {
    return this._storage.$init(newStorage);
  }

  /**
   * Export storage
   * @returns {*}
   */
  exportStorage() {
    return _.cloneDeep(this._storage.$getWholeStorageState());
  }

  /**
   * Get instance of type by schema path.
   * @param {string} pathInSchema - absolute path in schema
   */
  get(pathInSchema) {
    return this.$$schemaManager.getInstance(pathInSchema);
  }

  /**
   * Get instance of one of the types by a path
   * @param {string} path - absolute path or relative if context is used
   * @param {object} context - instance of root element
   * @returns {object|undefined} - instance of one of the types
   */
  child(path, context=undefined) {
    return this.$$schemaManager.getInstance(path, context);
  }

  /**
   * Get driver by path in schema.
   * You cat pass path deeper than certain driver path.
   * If no one driver has found it returns a default driver (memory)
   * @param {string} pathInSchema
   * @return {Object|undefined}
   */
  getDriver(pathInSchema) {
    return this.$$schemaManager.getDriver(pathInSchema);
  }

  /**
   * Listen to all the changes made by user.
   * @param {function} handler
   */
  onChange(handler) {
    this.$$events.on('change', handler);
  }

  /**
   * Listen to all the changes silent or by user.
   * Don't use it in common purpose. It's only usual for application or component inner state updates.
   * @param handler
   */
  onAnyChange(handler) {
    this.$$events.on('anyChange', handler);
  }

  off(handler) {
    this.$$events.off('change', handler);
    this.$$events.off('anyChange', handler);
  }

  registerType(typeName, typeClass) {
    this.$$schemaManager.registerType(typeName, typeClass);
  }

}
