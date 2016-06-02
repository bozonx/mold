export default class ItemInstance {
  constructor(root, state) {
    this._root = root;
    this._state = state;
    this.mold = {};

    this.mold = this._state.getValue(root);
  }

  /**
   * Get child
   * @param {string} path - path relative to instance root
   * @returns {object} promise
   */
  get(path) {
    return this._state.getValue(this._fullPath(path));
  }

  /**
   * Set child value
   * @param {string} path - path relative to instance root
   * @param {*} value
   * @returns {object} promise
   */
  set(path, value) {
    return this._state.setValue(this._fullPath(path), value);
  }

  /**
   * Is param exists on a path
   * @param {string} path - path relative to instance root
   * @returns {boolean}
   */
  has(path) {
    return this._state.hasValue(this._fullPath(path));
  }

  _fullPath(relativePath) {
    return `${this._root}.${relativePath}`;
  }

}
