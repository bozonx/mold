export default class _TypeBase {
  constructor(main) {
    this._main = main;
  }

  /**
   * Get root path
   * @returns {string}
   */
  get root() {
    return '' + this._root;
  }

  /**
   * Get real mold.
   */
  get mold() {
    return this._mold;
  }

  /**
   * Get copy of mold.
   */
  getMold() {
    return _.cloneDeep(this._mold);
  }

  $init(root) {
    this._root = root;
    // mold is just a link to the storage
    this._mold = this._main.$$state.getMold(this._root);
  }

  /**
   * Listen changes of instance and its primitives.
   * @param {function} handler
   */
  onChange(handler) {
    this._main.$$state.addListener(this._root, handler);
  }

  /**
   * Listen changes of instance and its descendants.
   * @param {function} handler
   */
  onChangeDeep(handler) {
    this._main.$$state.addDeepListener(this._root, handler);
  }

  /**
   * Unbind event listener.
   * @param {function} handler - handler to remove
   */
  off(handler) {
    this._main.$$state.removeListener(this._root, handler);
  }

  /**
   * It removes all the events listeners.
   */
  destroy() {
    this._main.$$state.destroyListeners(this._root);
  }

  /**
   * It removes all the events listeners.
   * Removes event listeners for children deeply too.
   */
  destroyDeep() {
    this._main.$$state.destroyListeners(this._root, true);
  }

  /**
   * It clears mold state for current instance and for its descendants.
   */
  clear() {
    this._main.$$state.clear(this._root);
  }

}
