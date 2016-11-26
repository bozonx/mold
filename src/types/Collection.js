// Simple collection. There're only add and remove methods.

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
    this._storagePath = this._root;
  }

  /**
   * Get child by primary id.
   * @param {number|string} primaryIdOrPath
   * @returns {object} - instance of child
   */
  child(primaryIdOrPath) {
    if (_.isUndefined(primaryIdOrPath))
      throw new Error(`You must pass a path argument.`);

    const pathToChild = concatPath(this._root, primaryIdOrPath);
    // get container instance
    const instance = this._main.$$schemaManager.getInstance(pathToChild);
    // reinit container instance with correct path
    instance.$init(pathToChild);

    return instance;
  }

  /**
   * Add item to beginning of a collection.
   * @param {object} item
   */
  unshift(item) {
    this._main.$$state.unshift(this._root, this._storagePath , item);
  }

  /**
   * Add to the end of a collection.
   * @param {object} item
   */
  push(item) {
    this._main.$$state.push(this._root, this._storagePath , item);
  }

  /**
   * Remove item by uniq key
   * @param item
   */
  remove(item) {
    this._main.$$state.remove(this._root, this._storagePath , item);
  }

}
