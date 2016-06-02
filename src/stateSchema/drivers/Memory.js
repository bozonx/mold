import _ from 'lodash';

export default class Memory {
  /**
   * It runs in app schema config file.
   * You can pass a config for handler in your config file in app.
   * @param config
   */
  constructor(config) {
    this._config = config;
    this._storage = {};
  }

  /**
   * It runs on app start. 
   * @param {string} root - root in full schema
   * @param {object} ownSchema - our part of schema
   * @param {object} schemaManager - instance of schemaManager
     */
  onInitializeHandler(root, ownSchema, schemaManager) {
    this._root = root;
    this._ownSchema = ownSchema;
    this._schemaManager = schemaManager;
  }

  /**
   * Get value by path
   * @param path
   * @returns {object} promise
   */
  getValue(path) {
    return _.get(this._storage, path);
    // TODO: return promise
  }

  /**
   * Checks for storage has a value
   * @param path
   * @returns {boolean}
   */
  hasValue(path) {
    return _.has(this._storage, path);
    // TODO: return promise
  }

  /**
   * create or update
   * @param {string} path
   * @param {mixed} value
   * @returns {object} promise
   */
  setValue(path, value) {
    this._silentSetValue(path, value);
    // TODO: return promise
    // TODO: rise event
  }

  /**
   * Init a value on app init
   * @param {string} path
   * @param {*} value
   */
  initDefaultValue(path, value) {
    this._silentSetValue(path, value);
  }

  /**
   * Handler form app schema config
   * @param {object} schema
   * @returns {{handler: Memory, schema: *}}
   */
  schemaHandler(schema) {
    return {
      handler: this,
      schema: schema,
    }
  }

  _silentSetValue(path, value) {
    _.set(this._storage, path, value);
  }
}
