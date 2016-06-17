import _ from 'lodash';

export default class ParamInstance {
  constructor(state, schemaManager) {
    this._state = state;
    this._schemaManager = schemaManager;
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
    var promise = this._state.getValue(this._root);
    this.updateMold();
    return promise;
  }

  /**
   * Set value
   * @param {string|number|boolean} value
   * @returns {Promise}
   */
  set(value) {
    var promise = this._state.setValue(this._root, value);
    this.updateMold();
    return promise;
  }

  /**
   * Set value silently
   * @param {string|number|boolean} value
   * @returns {Promise}
   */
  setSilent(value) {
    var promise = this._state.setSilent(this._root, value);
    this.updateMold();
    return promise;
  }

  updateMold() {
    this.mold = this._state.getComposition(this._root);
  }
}
