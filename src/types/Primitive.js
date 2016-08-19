// Primitives like boolean, string and number.

import _TypeBase from './_TypeBase';

export default class Primitive extends _TypeBase{
  constructor(main) {
    super(main);

    // TODO: в других типах тоже проставить type
    this.type = 'primitive';
  }

  $init(root, schema) {
    super.$init(root, schema);

    // update mold manually on each value change
    this._main.onMoldUpdate((event) => {
      if (event.path.indexOf(this._root) === 0) {
        this.updateMold();
      }
    });
  }

  /**
   * Load data to mold.
   * @returns {Promise}
   */
  load() {
    return this._main.state.load(this._root, this.getSourceParams());
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
    return this._main.state.save(this._root, this.getSourceParams());
  }

}
