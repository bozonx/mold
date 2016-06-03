import SchemaManager from './SchemaManager';
import State from './State';
import ItemInstance from './ItemInstance';
//import ListInstance from './ListInstance';


export default class SchemaInstance {
  constructor(schema) {
    this._schemaManager = new SchemaManager();
    this._state = new State();
    this._schemaManager.init(schema, this._state);
    this._state.init(this._schemaManager);

    // initialize all handlers, setup default values
    this._schemaManager.initHandlers();
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

  /**
   * Get list or item instance on path
   * @param {string} path
   */
  instance(path) {
    // TODO: выбрать list или item
    return new ItemInstance(path, this._state, this._schemaManager);
  }
}
