// Simple collection

import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class Collection extends _TypeBase {
  constructor(main) {
    super(main);

    this.type = 'collection';
  }

  $init(root, schema) {
    super.$init(root, schema);

    this._isDocument = !!this._main.schemaManager.getDocument(this._root);
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
   * Request for data.
   * Get one item from collection by primary id.  Example:
   *     collection.item(urlParams.id)
   * @param {number|string|undefined} noneOrIdOrPath - path, or promary id or nothing for whore collection
   * @returns {Promise} with item or collection
   */
  load(noneOrIdOrPath) {
    var path;
    if (_.isUndefined(noneOrIdOrPath)) {
      // load whore collection
      path = this._root;
      return this._main.state.load(path, this.getSourceParams());
    }
    else if (_.isNumber(noneOrIdOrPath) || _.isString(noneOrIdOrPath)) {
      // load collection child
      path = concatPath(this._root, noneOrIdOrPath);
      return this._main.state.load(path, this.getSourceParams());
    }
    else {
      throw new Error(`You must pass only number, string or undefined!`);
    }
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
   * Save unsaved added and remove elements.
   * @returns {Promise}
   */
  save() {
    return this._main.state.save(this._root, this.getSourceParams());
  }

}
