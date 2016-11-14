// It's runtime state manager
import _ from 'lodash';

import { findTheClosestParentPath, eachSchema, convertFromSchemaToLodash, concatPath } from './helpers';
import Request from './Request';


export default class State {
  init(main, storage) {
    this._main = main;
    this._storage = storage;
    this.$$request = new Request(this._main, storage);
    this._handlers = {};
    this._urlParams = {};

    var initialStorage = this._getInitialStorage(this._main.$$schemaManager.getFullSchema());
    this._storage.$init(initialStorage);
  }

  /**
   * Get parameters for source path template.
   * @param {string} storagePath
   * @returns {object}
   */
  getUrlParams(storagePath) {
    if (this._urlParams[storagePath]) return this._urlParams[storagePath];

    // For primitives - find the closest parent
    var findtheClosestParentPath = findTheClosestParentPath(storagePath, this._urlParams);

    return this._urlParams[findtheClosestParentPath];
  }

  /**
   * Set parameters for source path template.
   * @param {string} storagePath
   * @param {object} params
   */
  setUrlParams(storagePath, params) {
    this._urlParams[storagePath] = params;
  }

  onMoldUpdate(handler) {
    this._main.$$events.on('change', handler);
  }

  offMoldUpdate(handler) {
    this._main.$$events.off('change', handler);
  }

  /**
   * Get mold by path
   * @param {string} storagePath
   * @returns {*} - value from mold
   */
  getMold(storagePath) {
    return this._storage.get(storagePath);
  }

  /**
   * Set container or collection to mold
   * @param {string} storagePath
   * @param {*} value - valid value
   */
  update(storagePath, value) {
    this._checkNode(storagePath, value);

    this._storage.update(storagePath, value);
  }

  initResponse(url, initial) {
    // TODO: зачем делать через State??
    return this._storage.initResponse(url, initial);
  }

  getResponse(url) {
    // TODO: зачем делать через State??
    return this._storage.getResponse(url);
  }

  /**
   * Set document to __requests
   * @param {string} url
   * @param {object} value - valid value
   */
  updateResponse(url, value) {
    // this._checkNode(storagePath, value);
    this._storage.updateResponse(url, value);
  }


  /**
   * Add to beginning of a collection in store by user action.
   * It add item as is, not clones it.
   * @param {string} pathToCollection
   * @param {object} newItem
   * @param {number|undefined} pageNum
   */
  unshift(pathToCollection, newItem, pageNum = undefined) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToCollection);

    // TODO: перенести это в checkNode
    if (!_.includes(['collection', 'pagedCollection', 'documentsCollection'], schema.type))
      throw new Error(`You can add new item only to collection!`);

    this._checkNode(pathToCollection, newItem);
    if (_.isNumber(pageNum)) {
      this._storage.unshift(concatPath(pathToCollection, pageNum), newItem);
    }
    else {
      this._storage.unshift(pathToCollection, newItem);
    }
  }

  /**
   * Add to end of collection in store by user action.
   * It add item as is, not clones it.
   * @param {string} pathToCollection
   * @param {object} newItem
   * @param {number|undefined} pageNum
   */
  push(pathToCollection, newItem, pageNum = undefined) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToCollection);

    // TODO: перенести это в checkNode
    if (!_.includes(['collection', 'pagedCollection', 'documentsCollection'], schema.type))
      throw new Error(`You can add new item only to collection!`);

    this._checkNode(pathToCollection, newItem);

    if (_.isNumber(pageNum)) {
      this._storage.push(concatPath(pathToCollection, pageNum), newItem);
    }
    else {
      this._storage.push(pathToCollection, newItem);
    }
  }

  /**
   * Remove item from collection.
   * @param {string} pathToCollection
   * @param {object} itemToRemove
   * @param {number|undefined} pageNum
   */
  remove(pathToCollection, itemToRemove, pageNum = undefined) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToCollection);

    if (!_.includes(['collection', 'pagedCollection', 'documentsCollection'], schema.type))
      throw new Error(`You can remove only from collection!`);
    if (!_.isNumber(itemToRemove.$index))
      throw new Error(`Deleted item must has an $index param.`);

    if (_.isNumber(pageNum)) {
      this._storage.remove(concatPath(pathToCollection, pageNum), itemToRemove.$index);
    }
    else {
      this._storage.remove(pathToCollection, itemToRemove.$index);
    }
  }

  /**
   * Set page to paged collection in store.
   * It doesn't mark items as unsaved.
   * @param {string} pathToPagedCollection
   * @param {Array} page
   * @param {number} pageNum. It's required.
   */
  setPage(pathToPagedCollection, page, pageNum) {
    // It rises an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToPagedCollection);

    // TODO: перенести это в checkNode
    if (schema.type !== 'pagedCollection' && schema.type !== 'documentsCollection')
      throw new Error(`You can add new item only to paged collection!`);

    var preparedPage = _.cloneDeep(page);

    //this._checkNode(pathToPagedCollection, page);
    this._storage.addTo(pathToPagedCollection, preparedPage, pageNum);
  }

  /**
   * Set undefined instead page. It doesn't reduce pagedCollection length.
   * @param pathToPagedCollection
   * @param pageNum
   */
  removePage(pathToPagedCollection, pageNum) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToPagedCollection);

    if (!_.includes(['pagedCollection', 'documentsCollection'], schema.type))
      throw new Error(`You can remove  page only from pagedCollection of documentsCollection!`);

    this._storage.update(concatPath(pathToPagedCollection, pageNum), undefined);
  }

  destroy(storagePath) {
    if (this._handlers[storagePath]) {
      _.each(this._handlers[storagePath], (handler) => {
        // TODO: странное название события
        this._main.$$events.removeListener('mold.update::' + storagePath, handler);
      });
      this._handlers[storagePath] = [];
    }

    this._storage.clear(storagePath);
  }

  /**
   * Check for node. It isn't work with container.
   * It rises an error on invalid value or node.
   * @param {string} path - path to a param. (Not to container)
   * @param {*} value - value to set. (Not undefined and not an object)
   * @returns {boolean}
   * @private
   */
  _checkNode(path, value, schema) {
    // TODO: переделать!!!

    return true;


    schema = schema || this._main.$$schemaManager.get(path);



    var _checkRecursively = function(path, value, childPath, childSchema) {
      if (childSchema.type) {
        // param
        var valuePath = childPath;
        if (path !== '') valuePath = childPath.replace(path + '.', '');

        var childValue = _.get(value, valuePath);

        // If value doesn't exist for this schema branch - do nothing
        if (_.isUndefined(childValue)) return false;

        // It rises an error on invalid value
        this._checkNode(childPath, childValue, childSchema);

        return false;
      }

      // If it's a container - go deeper
      return true;
    };

    if (schema.type == 'array') {
      // For array
      // TODO: validate all items in list
      return true;
    }
    else if (schema.type == 'collection') {
      // For collection
      // TODO: do it for parametrized lists
      // TODO: validate all items in list
      return true;
    }
    else if (schema.type) {
      // For primitive
      // TODO: validate it!!!
      return true;
    }
    else if (!schema.type) {
      // It's a container - check values for all children
      //recursiveSchema(path, schema, _checkRecursively.bind(this, path, value));
      return true;
    }


    throw new Error(`Not valid value "${JSON.stringify(value)}" of param "${path}"! See validation rules in your schema.`);
  }

  _getInitialStorage(rawSchema) {
    var initialStorage = {};

    // Init storage. Collection's init behavior if different than in schema init.
    eachSchema(rawSchema, (path, value) => {
      //  convert from schema to lodash
      var storagePath = convertFromSchemaToLodash(path);
      if (value.type == 'document') {
        _.set(initialStorage, storagePath, {});

        // Go through inner param 'schema'
        //return 'schema';
      }
      else if (value.type == 'container') {
        _.set(initialStorage, storagePath, {});

        // Go through inner param 'schema'
        //return 'schema';
      }
      else if (value.type == 'documentsCollection') {
        _.set(initialStorage, storagePath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'pagedCollection') {
        _.set(initialStorage, storagePath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'collection') {
        _.set(initialStorage, storagePath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'array') {
        _.set(initialStorage, storagePath, []);

        // don't go deeper
        return false;
      }
      else if (_.includes(['boolean', 'string', 'number'], value.type)) {
        _.set(initialStorage, storagePath, null);

        // don't go deeper
        return false;
      }
    });

    return initialStorage;
  }

  // /**
  //  * Add change event handler on path.
  //  * @param {string} storagePath - full path in mold
  //  * @param {function} handler
  //  */
  // addListener(storagePath, handler) {
  //   // Save listener
  //   if (!this._handlers[storagePath]) this._handlers[storagePath] = [];
  //   this._handlers[storagePath].push(handler);
  //
  //   // Add listener
  //   this._main.events.on('mold.update::' + storagePath, handler);
  // }
  //
  // /**
  //  * Remove change event handler from path.
  //  * @param {string} storagePath - full path in mold
  //  * @param {function} handler
  //  */
  // removeListener(storagePath, handler) {
  //   // Remove listener
  //   if (!this._handlers[storagePath]) return;
  //   var index = _.indexOf(this._handlers[storagePath], handler);
  //   if (index < 0) return;
  //   this._handlers[storagePath].splice(index, 1);
  //
  //   // Unbind listener
  //   this._main.events.removeListener('mold.update::' + storagePath, handler);
  // }
}
