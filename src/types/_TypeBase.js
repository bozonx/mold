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
   * Get schema path
   * @returns {string}
   */
  get schemaPath() {
    return '' + this._schemaPath;
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

  $init(paths, schema) {
    this._moldPath = this._moldPath || paths.mold;
    this._schemaPath = this._schemaPath || paths.schema;
    this._storagePath = this._storagePath || paths.storage;
    this._schema = schema;
    // mold is just a link to the storage
    this._mold = this._mold || this._main.$$state.getMold(this._storagePath);
  }

  /**
   * Get instance of parent by mold path.
   * @return {object|undefined}
   */
  getParent() {
    const pathParts = splitPath(this._moldPath);
    pathParts.pop();
    if (!pathParts.length) return;
    const parentPath = joinPath(pathParts);
    return this._main.child(parentPath);
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
    this._main.$$state.clear(this._storagePath);
  }

}
