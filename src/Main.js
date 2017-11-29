import _ from 'lodash';

import Storage from './Storage';
import SchemaManager from './SchemaManager';
import StateManager from './StateManager';
import NodeManager from './NodeManager';
import DriverManager from './DriverManager';
import Config from './Config';

import StateType from './nodeTypes/State';
import Document from './nodeTypes/Document';
import Catalogue from './nodeTypes/Catalogue';

export default class Main {
  constructor(config, schema) {
    const configInstance = new Config(config);
    this.$$config = configInstance.get();
    this.$$events = this.$$config.eventEmitter;
    this.$$log = this.$$config.logger;
    this.$$nodeManager = new NodeManager(this);
    this.$$driverManager = new DriverManager(this);
    this.$$schemaManager = new SchemaManager(this);
    this.$$stateManager = new StateManager();
    this.$$storage = new Storage(this.$$events);

    // register base types
    this.$$nodeManager.register('state', StateType);
    this.$$nodeManager.register('document', Document);
    this.$$nodeManager.register('catalogue', Catalogue);

    // TODO: run plugins

    // initialize
    this.$$schemaManager.init();
    this.$$schemaManager.setSchema('', schema);
    this.$$stateManager.init(this, this.$$storage);
  }

  /**
   * Get real storage. Use it only for binding to frameworks.
   * For other ways use exportStorage.
   * @returns {object}
   */
  $getWholeStorageState() {
    return this.$$storage.$getWholeStorageState();
  }

  /**
   * Set storage data. Only for test or dev purposes.
   * @param {object} newStorage
   */
  $setWholeStorageState(newStorage) {
    return this.$$storage.$init(newStorage);
  }

  /**
   * Export storage
   * @returns {*}
   */
  exportStorage() {
    return _.cloneDeep(this.$$storage.$getWholeStorageState());
  }

  /**
   * Get instance of type by schema path.
   * @param {string} pathInSchema - absolute path in schema
   */
  get(pathInSchema) {
    return this.$$nodeManager.getInstance(pathInSchema);
  }

  /**
   * Get driver by path in schema.
   * You cat pass path deeper than certain driver path.
   * If no one driver has found it returns a default driver (memory)
   * @param {string} pathInSchema
   * @return {Object|undefined}
   */
  getDriver(pathInSchema) {
    return this.$$driverManager.getDriver(pathInSchema);
  }

  /**
   * Listen to all the changes made by user.
   * @param {function} handler
   */
  onChange(handler) {
    this.$$events.onChange('change', handler);
  }

  /**
   * Listen to all the changes silent or by user.
   * Don't use it in common purpose. It's only usual for application or component inner state updates.
   * @param handler
   */
  onAnyChange(handler) {
    this.$$events.onChange('anyChange', handler);
  }

  off(handler) {
    this.$$events.off('change', handler);
    this.$$events.off('anyChange', handler);
  }

  /**
   * Register your own type
   * @param typeName
   * @param typeClass
   */
  registerType(typeName, typeClass) {
    this.$$nodeManager.register(typeName, typeClass);
  }

  setSchema(mountPath, schema) {
    this.$$schemaManager.setSchema(mountPath, schema);
  }

}
