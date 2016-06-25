// Array type. It can contain only primitive types or other array

import _ from 'lodash';

// TODO: сделать валидацию типа дочерних элементов - itemsType

export default class PrimitiveArray {
  constructor(main) {
    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) this._updateMold();
    });
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this._updateMold();
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
    return this._main.state.getValue(this._root);
  }

  /**
   * Set all
   * @param {array} value - new array
   * @returns {Promise}
   */
  set(value) {
    if (!_.isArray(value))
      throw new Error(`You must pass a list argument.`);

    return this._main.state.setValue(this._root, value);
  }

  _updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }

}
