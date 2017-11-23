import { splitPath, joinPath } from '../helpers';

export default class _TypeBase {
  constructor(main) {
    this._main = main;
  }

  /**
   * Get mold path
   * @returns {string}
   */
  get root() {
    return '' + this._moldPath;
  }

  /**
   * Get real mold.
   */
  get mold() {
    //return this._mold;
    //return this._main.$$stateManager.getState(this._moldPath);
    return this.actions.default.mold;

    //return this._mold.state;
  }

  get schema() {
    return this._schema;
  }

  // /**
  //  * Get copy of mold.
  //  */
  // getMold() {
  //   return _.cloneDeep(this._mold);
  // }

  $init(moldPath, schema) {
    this._moldPath = this._moldPath || moldPath;
    this._schema = schema;
    // mold is just a link to the storage
    //this._mold = this._mold || this._main.$$stateManager.getState(this._moldPath);
  }

  /**
   * Listen changes of instance and its primitives.
   * @param {function} handler
   */
  onChange(handler) {
    this._main.$$state.addListener(this._storagePath, handler);
  }

  onAnyChange(handler) {
    this._main.$$state.addListener(this._storagePath, handler, true);
  }

  /**
   * Listen changes of instance and its descendants.
   * @param {function} handler
   */
  onChangeDeep(handler) {
    this._main.$$state.addDeepListener(this._storagePath, handler);
  }

  onAnyChangeDeep(handler) {
    this._main.$$state.addDeepListener(this._storagePath, handler, true);
  }

  /**
   * Unbind event listener.
   * @param {function} handler - handler to remove
   */
  off(handler) {
    this._main.$$state.removeListener(this._storagePath, handler);
  }

  /**
   * It removes all the events listeners.
   */
  destroy() {
    this._main.$$state.destroyListeners(this._storagePath);
  }

  /**
   * It removes all the events listeners.
   * Removes event listeners for children deeply too.
   */
  destroyDeep() {
    this._main.$$state.destroyListeners(this._storagePath, true);
  }

  /**
   * It clears mold state for current instance and for its descendants.
   * @param {object|undefined} eventData - additional data to event
   */
  clear(eventData=undefined) {
    this._main.$$state.clear(this._storagePath, eventData);
  }

}
