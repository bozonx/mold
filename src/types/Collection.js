// Simple collection

import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class Collection extends _TypeBase {
  constructor(main) {
    super(main);
  }

  get type() {
    return 'collection';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

  /**
   * Get child by primary id.
   * @param {number|string} primaryIdOrPath
   * @returns {object} - instance of child
   */
  child(primaryIdOrPath) {
    if (_.isUndefined(primaryIdOrPath))
      throw new Error(`You must pass a path argument.`);

    var pathToChild = concatPath(this._root, primaryIdOrPath);
    // get container instance
    var instance = this._main.schemaManager.getInstance(pathToChild);
    // reinit container instance with correct path
    instance.$init(pathToChild, instance.schema);

    return instance;
  }



  /**
   * Add item to beginning of list
   * @param item
   */
  addMold(item) {
    this._main.state.addMold(this._root, item);
  }

  /**
   * Remove item by uniq key
   * @param item
   */
  removeMold(item) {
    this._main.state.removeMold(this._root, item);
  }

  /**
   * Request for data.
   * Get one item from collection by primary id.  Example:
   *     collection.item(urlParams.id)
   * @param {number|string|undefined} noneOrIdOrPath - path, or promary id or nothing for whore collection
   * @returns {Promise} with item or collection
   */
  load(noneOrIdOrPath) {
    // TODO: наверное не нужно!!!

    if (_.isUndefined(noneOrIdOrPath)) {
      // load whore collection
      return this._main.state.load(this._root, this.getSourceParams());
    }
    else if (_.isNumber(noneOrIdOrPath) || _.isString(noneOrIdOrPath)) {
      // load collection child
      let path = concatPath(this._root, noneOrIdOrPath);
      return this._main.state.load(path, this.getSourceParams());
    }

    throw new Error(`You must pass only number, string or undefined!`);
  }

  /**
   * Save unsaved added and remove elements.
   * @returns {Promise}
   */
  save() {
    // TODO: наверное не нужно!!!
    return this._main.state.save(this._root, this.getSourceParams());
  }

  batchAdd(items) {
    // TODO: !!!!
  }

  batchRemove(items) {
    // TODO: !!!!
  }



}
