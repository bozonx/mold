import SchemaManager from './SchemaManager';
import State from './State';

export default class SchemaInstance {
  constructor(schema) {
    this.schemaManager = new SchemaManager();
    this._state = new State();
    this.schemaManager.init(schema, this._state);
    this._state.init(this.schemaManager);

    // initialize all handlers, setup default values
    this.schemaManager.initHandlers();
  }

  /**
   * get current runtime value
   * @param path
   * @returns {object} promise
   */
  get(path) {
    return this._state.getValue(path);
  }

  /**
   * Is has a path
   * @param path
   * @returns {boolean}
   */
  has(path) {
    return this._state.hasValue(path);
  }

  /**
   * set runtime value
   * @param {string} path
   * @param {mixed} value
   * @returns {object} promise
   */
  set(path, value) {
    return this._state.setValue(path, value);
  }
}
