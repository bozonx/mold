// Primitives like boolean, string and number.

import _ from 'lodash';

import _TypeBase from './_TypeBase';

export default class Primitive extends _TypeBase{
  constructor(main) {
    super(main);

    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) {
        this.updateMold();
        this._main.events.emit('mold.type.event::' + this._root);
      }
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
   * Load data to mold.
   * @returns {Promise}
   */
  get() {
    return this._main.state.load(this._root);
  }

  /**
   * Set param to mold and mark it as unsaved.
   * @param {boolean|string|number|null} value
   */
  setMold(value) {
    this._main.state.setMold(this._root, value);
  }

  /**
   * Save to driver if param is unsaved.
   * @returns {Promise}
   */
  save() {
    return this._main.state.saveContainerOrPrimitive(this._root);
  }

}
