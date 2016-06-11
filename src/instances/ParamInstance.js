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

  // /**
  //  * Get value.
  //  * @returns {object} promise
  //  */
  // value() {
  //   return this._state.getValue(this._root);
  // }

  /**
   * Set value
   * @param {string|number|boolean} value
   * @returns {object} promise
   */
  set(value) {
    var promise = this._state.setValue(this._root, value);
    this.updateMold();
    return promise;
  }

  /**
   * Set value silently
   * @param {string|number|boolean} value
   * @returns {object} promise
   */
  setSilent(value) {
    var promise = this._state.setSilent(this._root, value);
    this.updateMold();
    return promise;
  }

  /**
   * Reset to default
   */
  resetToDefault() {
    // TODO: test
    this._state.resetToDefault(this._root);
  }

  updateMold() {
    this.mold = this._state.getDirectly(this._root);
  }

  _initComposition() {
    if (_.isUndefined(this._state.getDirectly(this._root)))
      this._state.setDirectly(this._root, null);
  }
}