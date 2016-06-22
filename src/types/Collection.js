// We can filter or find param
import _ from 'lodash';

import { findPrimary } from '../helpers';

export default class Collection {
  constructor(main) {
    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) this.updateMold();
    });
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this._initComposition();
    this.updateMold();
  }

  /**
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    return '' + this._root;
  }

  /**
   * Get child by primary id.
   * @param {number|string} primaryId - In this version it supports only primary id, not path.
   * @returns {object} - instance of child
   */
  child(primaryId) {
    if (_.isUndefined(primaryId))
      throw new Error(`You must pass a path argument.`);

    var fullPath = `${this._root}{${primaryId}}`;
    // get container instance
    var instance = this._main.schemaManager.getInstance(fullPath);
    // reinit container instance with correct path
    instance.init(fullPath, instance.schema);

    return instance;
  }

  /**
   * Get filtered list. Example:
   *     collection.filter({name: 'item'})
   * @param {object} params - parameters for query
   */
  filter(params) {
    return this._main.state.filter(this._root, params);
  }

  /**
   * Find one item via params. Example:
   *     collection.find({id: 1})
   * @param {object} params - parameters for query
   */
  find(params) {
    return this._main.state.find(this._root, params);
  }

  /**
   * Get one item from collection by primary id.  Example:
   *     collection.item(urlParams.id)
   * @param {number|string} primaryId
   * @returns {Promise} with item
   */
  item(primaryId) {
    var primaryKeyName = findPrimary(this.schema.item);
    return this.find({[primaryKeyName]: primaryId});
  }

  /**
   * Add item to list
   * @param item
   * @returns {object} promise
   */
  add(item) {
    return this._main.state.addItem(this._root, item);
  }

  /**
   * Remove item by uniq key
   * @param item
   * @returns {object} promise
   */
  remove(item) {
    return this._main.state.removeItem(this._root, item);
  }

  /**
   * Clear all the list
   */
  clear() {
    // TODO: очистить молд, сделать запрос в драйвер
    // _.remove(this._main.state.getComposition(this._root));
    // this.updateMold();
  }

  updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }

  _fullPath(relativePath) {
    if (_.startsWith(relativePath, '['))
      // TODO: without dot
      return `${this._root}${relativePath}`;

    return `${this._root}.${relativePath}`;
  }

  _initComposition() {
    // TODO: это нужно делать при инициализации всей схемы
    if (_.isUndefined(this._main.state.getComposition(this._root)))
      this._main.state.setComposition(this._root, []);
  }
}
