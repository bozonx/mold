import _ from 'lodash';

export default class Composition {
  constructor() {
    this._storage = {};
  }

  /**
   * Get value from compositon.
   * It hopes a path is correct
   * To get root, pass '' to a path
   * @param {string} path - absolute path
   * @returns {*} - value by path
   */
  get(path) {
    // TODO: maybe return immutable?
    if (path === '') return this._storage;
    return _.get(this._storage, path);
  }

  /**
   * Checks for storage has a value
   * If you pass '' to a path, it means root and returns true
   * @param {string} path - absolute path
   * @returns {boolean}
   */
  has(path) {
    if (path === '') return true;
    return _.has(this._storage, path);
  }

  /**
   * Set value to composition
   * It hopes a path and a value are correct.
   * It create or update value on the path.
   * @param {string} path - absolute path
   * @param {*} value - new value
   */
  set(path, value) {
    // TODO: поддержка path = ''
    _.set(this._storage, path, value);
  }
}
