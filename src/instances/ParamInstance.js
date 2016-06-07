import _ from 'lodash';

export default class ParamInstance {
  constructor(root, schema, state, schemaManager) {
    this._root = root;
    this._state = state;
    this._schemaManager = schemaManager;
    this.schema = schema;

    // mold is just a link to the composition
    this.mold = this._initComposition();
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
   * @param {string|number|boolean} value
   * @returns {object} promise
   */
  set(path, value) {
    return this._state.setValue(this._fullPath(path), value);
  }

  setSilent(path, value) {
    // TODO: silently
  }

  /**
   * Reset to default
   * @param {string|undefined} path - relative to instance root. If path doesn't pass, it means use instance root.
   */
  resetToDefault(path) {
    if (path) {
      this._state.resetToDefault(this._fullPath(path));
    }
    else {
      this._state.resetToDefault(this._root);
    }
  }

  _fullPath(relativePath) {
    return `${this._root}.${relativePath}`;
  }

  _initComposition() {
    this._state.setDirectly(this._root, null);

    return this._state.getDirectly(this._root);
  }
}
