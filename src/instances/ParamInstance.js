import _ from 'lodash';

export default class ParamInstance {
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
   * Get value.
   * @returns {object} promise
   */
  get() {
    // TODO: наверное переименовать в value, так как get должен возвращать instance
    return this._state.getValue(this._root);
  }

  /**
   * Set child value
   * @param {string|number|boolean} value
   * @returns {object} promise
   */
  set(value) {
    var promise = this._state.setValue(this._root, value);
    this._updateMold();
    return promise;
  }

  setSilent(value) {
    // TODO: silently
  }

  /**
   * Reset to default
   */
  resetToDefault() {
    // TODO: test
    this._state.resetToDefault(this._root);
  }

  _updateMold() {
    this.mold = this._state.getDirectly(this._root);
  }

  _initComposition() {
    if (_.isUndefined(this._state.getDirectly(this._root)))
      this._state.setDirectly(this._root, null);

    return this._state.getDirectly(this._root);
  }
}
