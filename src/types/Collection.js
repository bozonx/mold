// Simple collection. There're only add and remove methods.

import _ from 'lodash';

import { concatPath, getFirstChildPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class Collection extends _TypeBase {
  static validateSchema(schema, schemaPath) {
    // if (!_.isPlainObject(schema.item))
    //   return `Schema definition of collection on "${schemaPath}" must have an "item" param!`;
  }

  constructor(main) {
    super(main);
  }

  get type() {
    return 'collection';
  }

  $init(paths, schema) {
    super.$init(paths, schema);
  }

  /**
   * Get instance of child
   * @param {string|number} primaryId - primary id like 0 or '[0]'
   * @returns {object} - instance of child
   */
  child(primaryId) {
    const preparedPath = (_.isNumber(primaryId)) ? `[${primaryId}]` : primaryId;
    return this._main.child(preparedPath, this);
  }

  /**
   * Get paths of child of first level.
   * @param {string} primaryId
   * @returns {{mold: string, schema: string, storage: string}}
   */
  $getChildPaths(primaryId) {
    return {
      mold: concatPath(this._moldPath, primaryId),
      schema: concatPath(this._schemaPath, 'item'),
      storage: concatPath(this._storagePath, primaryId),
    }
  }


  /**
   * Get instance of child of first level.
   * @param {string} primaryId - id of element, like '[0]'
   * @returns {Object|undefined} - if undefined - it means not found.
   */
  $getChildInstance(primaryId) {
    if (!primaryId || !_.isString(primaryId)) return;
    if (!primaryId.match(/^\[\d+]$/)) this._main.$$log.fatal(`Bad primaryId "${primaryId}"`);

    const paths = this.$getChildPaths(primaryId);

    if (!paths.storage) return;

    return this._main.$$schemaManager.$getInstanceByFullPath(paths);
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
