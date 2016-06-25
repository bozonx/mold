export default class Container {
  constructor(main) {
    this._main = main;
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = this._main.state.getComposition(this._root);
  }

  /**
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    return '' + this._root;
  }

  /**
   * Get value by path.
   * If you pass path = '' or undefined, it means get data for this container
   * @param {string} path - path relative to this instance root
   * @returns {Promise}
   */
  get(path) {
    return this._main.state.getValue((path) ? this._fullPath(path) : this._root);
  }

  /**
   * Get child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of param or list or container
   */
  child(path) {
    if (!path)
      throw new Error(`You must pass a path argument.`);
    
    return this._main.schemaManager.getInstance(this._fullPath(path));
  }

  /**
   * Set child value for child or for all children.
   * If you pass path = '' or undefined, it means set data for the all children of this container
   * @param {string} path - path relative to instance root
   * @param {*} value for child or children
   * @returns {Promise}
   */
  set(path, value) {
    return this._main.state.setValue((path) ? this._fullPath(path) : this._root, value);
  }

  _fullPath(relativePath) {
    return `${this._root}.${relativePath}`;
  }
}
