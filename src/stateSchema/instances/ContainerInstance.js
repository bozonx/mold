import _ from 'lodash';

export default class ContainerInstance {
  constructor(root, schema, state, schemaManager) {
    this._root = root;
    this._state = state;
    this._schemaManager = schemaManager;
    this.schema = schema;

    // mold is just a link to the composition
    this.mold = this._initComposition();
  }

  /**
   * Get child instance
   * @param {string} path - path relative to instance root
   * @returns {object} - instance of param or list or container
   */
  get(path) {
    return this._schemaManager.getInstance(this._fullPath(path));
  }

  /**
   * Set child value for child or for all children if you pass path = ''
   * @param {string} path - path relative to instance root
   * @param {object} value for child or children
   * @returns {object} promise
   */
  set(path, value) {
    if (path === '') {
      // Set value for all children
      this._state.setValue(this._root, value);
    }
    else {
      // set value for one param
      // TODO: check - children by path must be a param, not a container
      this._state.setValue(this._fullPath(path), value);
    }
  }

  setSilent(path, values) {
    // TODO: установить значения для всех потомков или для одного если передан path
  }

  /**
   * Is param exists on a path
   * It just check schema.
   * @param {string} path - path relative to instance root
   * @returns {boolean}
   */
  has(path) {
    return this._schemaManager.has(this._fullPath(path));
  }

  /**
   * Reset to default
   * @param {string|undefined} path - relative to instance root. If path doesn't pass, it means use instance root.
   */
  resetToDefault(path) {
    // TODO: do it for all children
    // if (path) {
    //   this._state.resetToDefault(this._fullPath(path));
    // }
    // else {
    //   this._state.resetToDefault(this._root);
    // }
  }

  _fullPath(relativePath) {
    return `${this._root}.${relativePath}`;
  }

  _initComposition() {
    // It's a container
    _.each(this.schema, (param, name) => {
      if (param.type) {
        this._state.setDirectly(this._fullPath(name), null);
      }
      else {
        // TODO: do it recursively - use setSilent. А может вообще не нужно
      }
    });
    
    return this._state.getDirectly(this._root);
  }
}
