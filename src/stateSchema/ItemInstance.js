export default class ItemInstance {
  constructor(root, state, schemaManager) {
    this._root = root;
    this._state = state;
    this._schemaManager = schemaManager;

    // TODO: it must be a link to the composition - получить свой композишн из стейта
    this.mold = {};

    // TODO: разве так надо делать mold???
    //this.mold = this._state.getValue(root);

    this._initComposition();
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

  /**
   * Is param exists on a path
   * @param {string} path - path relative to instance root
   * @returns {boolean}
   */
  has(path) {
    return this.schemaManager.has(this._fullPath(path));
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
    this._composition.set(path, null);
  }
}
