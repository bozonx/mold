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
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    return '' + this._root;
  }

  /**
   * Get child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of param or list or container
   */
  child(path) {
    if (!path)
      throw new Error(`You must pass a path argument.`);
    return this._schemaManager.getInstance(this._fullPath(path));
  }

  /**
   * Set child value for child or for all children if you pass path = ''
   * @param {string} path - path relative to instance root
   * @param {object} value for child or children
   * @returns {object} promise
   */
  set(path, value) {
    // TODO: return promise
    if (path === '') {
      // TODO: test it
      // Set value for all children
      this._state.setValue(this._root, value);
    }
    else {
      // set value for one param
      this._state.setValue(this._fullPath(path), value);
    }
    this._updateMold();
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
    this._updateMold();
  }

  _fullPath(relativePath) {
    return `${this._root}.${relativePath}`;
  }

  _updateMold() {
    this.mold = this._state.getDirectly(this._root);
  }

  _initComposition() {
    // TODO: сбрасывать на null только если значение не было проставленно ранее
    // if (_.isUndefined(this._state.getDirectly(this._root)))
    //   this._state.setDirectly(this._root, null);
    
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
