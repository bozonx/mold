import _ from 'lodash';

export default class Composition {
  constructor() {
    this._storage = {};
  }

  /**
   * Get value from compositon.
   * It hopes a path is correct
   * @param path
   * @returns {*}
   */
  get(path) {
    // TODO: maybe return immutable?
    return _.get(this._storage, path);
  }

  /**
   * Checks for storage has a value
   * @param path
   * @returns {boolean}
   */
  has(path) {
    return _.has(this._storage, path);
  }

  /**
   * Set value to composition
   * It hopes a path and a value are correct
   * @param path
   * @param value
   */
  set(path, value) {
    _.set(this._storage, path, value);
  }
}
