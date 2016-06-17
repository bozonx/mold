// Array type. It can contain only primitive types or other array

import _ from 'lodash';

// TODO: сделать валидация типа дочерних элементов

export default class ArrayInstance {
  constructor(state, schemaManager) {
    this._state = state;
    this._schemaManager = schemaManager;
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this._initComposition();
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
   * Get all
   * @returns {Promise}
   */
  get() {
    var promise = this._state.getValue(this._root);
    this.updateMold();
    return promise;
  }

  /**
   * Set all
   * @param {array} value - new array
   * @returns {Promise}
   */
  set(value) {
    if (!_.isArray(value))
      throw new Error(`You must pass a list argument.`);

    var promise = this._state.setValue(this._root, value);
    this.updateMold();
    return promise;
  }

  updateMold() {
    this.mold = this._state.getComposition(this._root);
  }

  _initComposition() {
    // TODO: это нужно делать при инициализации всей схемы
    if (_.isUndefined(this._state.getComposition(this._root)))
      this._state.setComposition(this._root, []);
  }
}
