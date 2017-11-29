import { splitPath, joinPath } from '../helpers';
import _Action from './_Action';


export default class _TypeBase {
  constructor(main) {
    this._main = main;
  }

  /**
   * Get mold path
   * @returns {string}
   */
  get root() {
    return this._moldPath;
  }

  /**
   * Get real mold.
   */
  get mold() {
    return this.actions.default.mold;
  }

  get schema() {
    return this._schema;
  }

  $init(moldPath, schema) {
    this._moldPath = moldPath;
    this._schema = schema;
  }

  $createAction(actionName, cb) {
    const ActionClass = cb(_Action);

    const instance =  new ActionClass(
      this._main.$$storage,
      this,
      this._moldPath,
      actionName,
      this.$fullSchema);
    instance.init();

    return instance;
  }

  /**
   * It clears mold state for current instance and for its descendants.
   */
  clear() {
    // TODO: test it
    return this.actions.default.clear();
  }

  /**
   * Listen changes of instance and its primitives.
   * @param {function} handler
   */
  onChange(handler) {
    return this.actions.default.onChange(handler);
  }

  onAnyChange(handler) {
    return this.actions.default.onAnyChange(handler);
  }

  /**
   * Unbind event listener.
   * @param {function} handler - handler to remove
   */
  off(handler) {
    return this.actions.default.off(handler);
  }

  /**
   * It removes all the events listeners.
   */
  destroy() {
    return this.actions.default.destroy();
  }

  // /**
  //  * Listen changes of instance and its descendants.
  //  * @param {function} handler
  //  */
  // onChangeDeep(handler) {
  //   // TODO: use action
  //   this._main.$$state.addDeepListener(this._storagePath, handler);
  // }

  // onAnyChangeDeep(handler) {
  //   // TODO: use action
  //   this._main.$$state.addDeepListener(this._storagePath, handler, true);
  // }

  // /**
  //  * It removes all the events listeners.
  //  * Removes event listeners for children deeply too.
  //  */
  // destroyDeep() {
  //   // TODO: use action
  //   this._main.$$state.destroyListeners(this._storagePath, true);
  // }

}
