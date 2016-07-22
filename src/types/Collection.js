// Simple collection

import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class Collection extends _TypeBase {
  constructor(main) {
    super(main);

    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) {
        this._main.events.emit('mold.type.event::' + this._root);
      }
    });
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this.updateMold();
    this._isDocument = !!this._main.schemaManager.getDocument(this._root);
  }

  /**
   * Get child by primary id.
   * @param {number|string} primaryId
   * @returns {object} - instance of child
   */
  child(primaryId) {
    if (_.isUndefined(primaryId)) {
      throw new Error(`You must pass a path argument.`);
    }
    else if (!_.isNumber(primaryId)) {
      throw new Error(`In this version it supports only primary id, not path.`);
    }

    var fullPath = concatPath(this._root, primaryId);
    // get container instance
    var instance = this._main.schemaManager.getInstance(fullPath);
    // reinit container instance with correct path
    instance.init(fullPath, instance.schema);

    return instance;
  }

  /**
   * Request for data.
   * Get one item from collection by primary id.  Example:
   *     collection.item(urlParams.id)
   * @param {number|string|undefined} noneOrIdOrPath - path, or promary id or nothing for whore collection
   * @returns {Promise} with item or collection
   */
  get(noneOrIdOrPath) {
    var path;
    if (_.isUndefined(noneOrIdOrPath)) {
      path = this._root;
      return this._main.state.load(path);
    }
    else if (_.isNumber(noneOrIdOrPath)) {
      path = concatPath(this._root, noneOrIdOrPath);
      return this._main.state.load(path);
    }
    else if (_.isString(noneOrIdOrPath)) {
      // TODO: do it and test it
      // path = `${this._root}.${noneOrIdOrPath}`;
      // return this._main.state.load(path);
    }
    else {
      throw new Error(`You must pass only number or string or undefined!`);
    }
  }

  /**
   * Add item to list
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
    return this._main.state.saveCollection(this._root);
  }

}
