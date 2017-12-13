import { splitPath, joinPath } from '../helpers/helpers';
import ActionBase from '../ActionBase';


export default class _NodeBase {
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
    const ActionClass = cb(ActionBase);

    const instance =  new ActionClass(
      this._main,
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
  off(eventName, handler) {
    return this.actions.default.off(eventName, handler);
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
