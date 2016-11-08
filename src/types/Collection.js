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

  $init(root) {
    super.$init(root);
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
    var instance = this._main.$$schemaManager.getInstance(pathToChild);
    // reinit container instance with correct path
    instance.$init(pathToChild);

    return instance;
  }

  /**
   * Add item to beginning of list
   * @param item
   */
  unshift(item) {
    this._main.$$state.unshift(this._root, item);
  }

  /**
   * Remove item by uniq key
   * @param item
   */
  // TODO: переименовать в remove
  removeMold(item) {
    this._main.$$state.removeMold(this._root, item);
  }

}
