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
    this.$$schemaManager = new SchemaManager();
    this.$$state = new State();

    this.$$storage = new Storage(this.$$events);

    // initialize
    this.$$schemaManager.init(schema, this);
    this.$$state.init(this, this.$$storage);

    // register base types
    this.$$schemaManager.registerType('pagedCollection', PagedCollection);
    this.$$schemaManager.registerType('collection', Collection);
    this.$$schemaManager.registerType('container', Container);
    this.$$schemaManager.registerType('document', Document);
    this.$$schemaManager.registerType('documentsCollection', DocumentsCollection);

    this.$$schemaManager.checkSchema();
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
   * @param {string} path - absolute path or relative if context is used
   * @param {object} context - instance of root element
   * @returns {object|undefined} - instance of one of the types
   */
  child(path, context=undefined) {
    return this.$$schemaManager.getInstance(path, context);
  }

  onAnyUpdate(handler) {
    this.$$state.onAnyUpdate(handler);
  }

  offAnyUpdate(handler) {
    this.$$state.offAnyUpdate(handler);
  }

  registerType(typeName, typeClass) {
    this.$$schemaManager.registerType(typeName, typeClass);
  }

}
