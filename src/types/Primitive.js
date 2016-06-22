export default class Primitive {
  constructor(main) {
    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
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
   * Get value.
   * @returns {Promise}
   */
  get() {
    var promise = this._main.state.getValue(this._root);
    this.updateMold();
    return promise;
  }

  /**
   * Set value
   * @param {string|number|boolean} value
   * @returns {Promise}
   */
  set(value) {
    var promise = this._main.state.setValue(this._root, value);
    this.updateMold();
    return promise;
  }

  /**
   * Set value silently
   * @param {string|number|boolean} value
   * @returns {Promise}
   */
  setSilent(value) {
    var promise = this._main.state.setSilent(this._root, value);
    this.updateMold();
    return promise;
  }

  updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }
}
