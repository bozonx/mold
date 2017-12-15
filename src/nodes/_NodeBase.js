import { splitPath, joinPath } from '../helpers/helpers';
import ActionBase from '../ActionBase';


export default class _NodeBase {
  constructor(main) {
    this._main = main;
    this.$defaultAction = 'default';
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
    this.actions = {
      'default': this.$generateDefaultAction(),
    };
  }

  $createAction(actionName, cb) {
    const ActionClass = cb(ActionBase);

    const instance =  new ActionClass(
      this._main,
      this,
      this._moldPath,
      actionName,
      this.$fullSchema
    );
    instance.init();

    return instance;
  }

  set(newState) {
    this.actions.default.set(newState);
  }

  /**
   * Update container data
   * @param {string} newState
   */
  update(newState) {
    this.actions.default.update(newState);
  }

  updateSilent(newState) {
    this.actions.default.updateSilent(newState);
  }

  /**
   * It clears mold state for current instance and for its descendants.
   */
  // clear() {
  //   return this.actions.default.clear();
  // }

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
   * @param {string} eventName - 'change' or 'any'
   * @param {function} handler - handler to remove
   */
  off(eventName, handler) {
    return this.actions.default.off(eventName, handler);
  }

  /**
   * It removes all the events listeners and clears action storage.
   */
  destroy() {
    return this.actions.default.destroy();
  }

}
