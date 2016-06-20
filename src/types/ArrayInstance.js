// Array type. It can contain only primitive types or other array

import _ from 'lodash';

import events from '../events';

// TODO: сделать валидация типа дочерних элементов

export default class ArrayInstance {
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
    var promise = this._main.state.getValue(this._root);
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

    var promise = this._main.state.setValue(this._root, value);
    this.updateMold();
    return promise;
  }

  updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }

  _initComposition() {
    // TODO: это нужно делать при инициализации всей схемы
    if (_.isUndefined(this._main.state.getComposition(this._root)))
      this._main.state.setComposition(this._root, []);
  }
}
