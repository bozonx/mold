import events from '../events';

export default class ContainerInstance {
  constructor(main) {
    this._main = main;

    events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) this.updateMold();
    });
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this.updateMold();
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
    var promise = this._main.state.getValue((path) ? this._fullPath(path) : this._root);
    this.updateMold();
    return promise;
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
    var promise = this._main.state.setValue((path) ? this._fullPath(path) : this._root, value);
    this.updateMold();
    return promise;
  }

  /**
   * Set child value for child or for all children silently.
   * If you pass path = '' or undefined, it means set data for the all children of this container
   * @param {string} path - path relative to instance root
   * @param {*} value for child or children
   * @returns {Promise}
   */
  setSilent(path, value) {
    var promise = this._main.state.setSilent((path) ? this._fullPath(path) : this._root, value);
    this.updateMold();
    return promise;
  }

  /**
   * Is param exists on a path
   * It just check schema.
   * @param {string} path - path relative to instance root
   * @returns {boolean}
   */
  has(path) {
    if (!path)
      throw new Error(`You must pass a path argument.`);
    return this._main.schemaManager.has(this._fullPath(path));
  }

  updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }

  _fullPath(relativePath) {
    return `${this._root}.${relativePath}`;
  }
}
