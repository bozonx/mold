export default class Primitive {
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
   * Get value.
   * @returns {Promise}
   */
  get() {
    return this._main.state.getValue(this._root);
  }

  /**
   * Set value
   * @param {string|number|boolean} value
   * @returns {Promise}
   */
  set(value) {
    return this._main.state.setValue(this._root, value);
  }

  _updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }
}
