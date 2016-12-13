export default class _TypeBase {
  constructor(main) {
    this._main = main;
  }

  /**
   * Get root path
   * @returns {string}
   */
  get root() {
    return '' + this._moldPath;
  }

  /**
   * Get real mold.
   */
  get mold() {
    return this._mold;
  }

  get schema() {
    return this._schema;
  }

  /**
   * Get copy of mold.
   */
  getMold() {
    return _.cloneDeep(this._mold);
  }

  $init(moldPath) {
    this._moldPath = moldPath;
    this._storagePath = this._storagePath || moldPath;
    this._schema = this._main.$$schemaManager.get(this._storagePath);
    // mold is just a link to the storage
    if (!this._mold) this._mold = this._main.$$state.getMold(this._storagePath);
  }

  /**
   * Listen changes of instance and its primitives.
   * @param {function} handler
   */
  onChange(handler) {
    this._main.$$state.addListener(this._moldPath, handler);
  }

  /**
   * Listen changes of instance and its descendants.
   * @param {function} handler
   */
  onChangeDeep(handler) {
    this._main.$$state.addDeepListener(this._moldPath, handler);
  }

  /**
   * Unbind event listener.
   * @param {function} handler - handler to remove
   */
  off(handler) {
    this._main.$$state.removeListener(this._moldPath, handler);
  }

  /**
   * It removes all the events listeners.
   */
  destroy() {
    this._main.$$state.destroyListeners(this._moldPath);
  }

  /**
   * It removes all the events listeners.
   * Removes event listeners for children deeply too.
   */
  destroyDeep() {
    this._main.$$state.destroyListeners(this._moldPath, true);
  }

  /**
   * It clears mold state for current instance and for its descendants.
   */
  clear() {
    this._main.$$state.clear(this._moldPath);
  }

}
