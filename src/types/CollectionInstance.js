// We can filter or find param
import _ from 'lodash';

import events from '../events';
import { findPrimary, convertToSchemaPath } from '../helpers';

export default class CollectionInstance {
  constructor(main) {
    this._main = main;

    events.on('mold.composition.update', (data) => {
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

    var fullPath = this._fullPath(`[${primaryId}]`);
    var schemaPath = convertToSchemaPath(fullPath);
    // get container instance
    var instance = this._main.schemaManager.getInstance(schemaPath);
    // reinit container instance with correct path
    instance.init(fullPath, instance.schema);

    return instance;
  }

  /**
   * Get filtered list. Example:
   *     collection.filter({name: {contents: 'item'}})
   * @param {object} params - parameters for query
   */
  filter(params) {
    // TODO: do it
  }

  /**
   * Find one item via params. Example:
   *     collection.find({id: 1})
   * @param {object} params - parameters for query
   */
  find(params) {
    // TODO: do it
  }

  /**
   * Get one item from collection by primary id.  Example:
   *     collection.item(urlParams.id)
   * @param {number|string} primaryId
   * @returns {Promise} with item
   */
  item(primaryId) {
    // TODO: get primary id name
    var primaryKeyName = findPrimary(this.schema.item);
    return this.find({[primaryKeyName]: primaryId});
  }

  /**
   * Like filter, but it load one page. Example:
   *     collection.page(1)
   *     collection.page(2, {active: true})
   * Page numbers start from 1.
   * @param {number} pageNum -
   * @param {object} [params] - parameters for query
   * @returns {Promise} with items list
   */
  page(pageNum, params) {
    return this.filter({...params, page: 1});
  }


  /**
   * Add item to list
   * @param item
   * @returns {object} promise
   */
  add(item) {
    var promise = this._main.state.addItem(this._root, item);
    this.updateMold();
    return promise;
  }

  /**
   * Remove item by uniq key
   * @param item
   * @returns {object} promise
   */
  remove(item) {
    var promise = this._main.state.removeItem(this._root, item);
    this.updateMold();
    return promise;
  }

  /**
   * Is param exists on a path
   * It check schema and param in composition.
   * It doesn't do request to driver.
   * @param {string} path - path relative to instance root
   * @returns {boolean}
   */
  has(path) {
    // TODO: test deep param

    // if (!path)
    //   throw new Error(`You must pass a path argument.`);
    //
    // // Check schema
    // var schemaPath = this._convertToSchemaPath(path);
    // if (this._main.schemaManager.has(this._fullPath(schemaPath))) return false;

    // TODO: нужно сделать поиск элементов в mold, так как в пути будет primaryKey, а нам нужен index
    // проще всего преобразовать primaryKey в index
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
