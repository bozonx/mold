// Simple collection. There're only add and remove methods.

import _ from 'lodash';

import { concatPath, getFirstChildPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class Collection extends _TypeBase {
  constructor(main) {
    super(main);
  }

  get type() {
    return 'collection';
  }

  $init(moldPath, schemaPath, schema) {
    super.$init(moldPath, schemaPath, schema);
  }

  /**
   * Get instance of child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of child
   */
  child(path) {
    const preparedPath = (_.isNumber(path)) ? `[${path}]` : path;
    return this._main.child(preparedPath, this);
  }

  $getChildInstance(primaryIdOrSubPath, restOfPath) {
    const childPath = getFirstChildPath(primaryIdOrSubPath);
    const fullChildPath = concatPath(this._moldPath, childPath);

    // get container instance
    return this._main.$$schemaManager.$getInstanceByFullPath(fullChildPath);
  }

  /**
   * Add item to beginning of a collection.
   * @param {object} item
   */
  unshift(item) {
    this._main.$$state.unshift(this._moldPath, this._storagePath , item);
  }

  /**
   * Add to the end of a collection.
   * @param {object} item
   */
  push(item) {
    this._main.$$state.push(this._moldPath, this._storagePath , item);
  }

  /**
   * Remove item by uniq key
   * @param item
   */
  remove(item) {
    this._main.$$state.remove(this._moldPath, this._storagePath , item);
  }

}
