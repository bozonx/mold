// It's runtime state manager
import _ from 'lodash';

import { findTheClosestParentPath, eachSchema, convertFromSchemaToLodash, concatPath } from './helpers';
import Request from './Request';


export default class State {
  init(main, storage) {
    this._main = main;
    this._storage = storage;
    this.$$request = new Request(this._main);
    this._handlers = {};
    this._urlParams = {};

    var initialStorage = this._getInitialStorage(this._main.$$schemaManager.getFullSchema());
    this._storage.$init(initialStorage);
  }

  /**
   * Get parameters for source path template.
   * @param {string} moldPath
   * @returns {object}
   */
  getUrlParams(moldPath) {
    if (this._urlParams[moldPath]) return this._urlParams[moldPath];

    // For primitives - find the closest parent
    var findtheClosestParentPath = findTheClosestParentPath(moldPath, this._urlParams);

    return this._urlParams[findtheClosestParentPath];
  }

  /**
   * Set parameters for source path template.
   * @param {string} moldPath
   * @param {object} params
   */
  setUrlParams(moldPath, params) {
    this._urlParams[moldPath] = params;
  }

  onAnyUpdate(handler) {
    this._main.$$events.on('change', handler);
  }

  offAnyUpdate(handler) {
    this._main.$$events.off('change', handler);
  }

  /**
   * Get mold by path
   * @param {string} moldPath
   * @returns {*} - value from mold
   */
  getMold(moldPath) {
    return this._storage.get(moldPath);
  }

  /**
   * Set container or collection to mold
   * @param {string} moldPath
   * @param {*} value - valid value
   */
  update(moldPath, value) {
    this._checkNode(moldPath, value);

    this._storage.update(moldPath, value);
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
    // this._checkNode(moldPath, value);
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
    const schema = this._main.$$schemaManager.get(pathToPagedCollection);

    // TODO: перенести это в checkNode
    if (schema.type !== 'pagedCollection' && schema.type !== 'documentsCollection')
      throw new Error(`You can add new item only to paged collection!`);

    const preparedPage = _.cloneDeep(page);

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
    const schema = this._main.$$schemaManager.get(pathToPagedCollection);

    if (!_.includes(['pagedCollection', 'documentsCollection'], schema.type))
      throw new Error(`You can remove  page only from pagedCollection of documentsCollection!`);

    this._storage.update(concatPath(pathToPagedCollection, pageNum), undefined);
  }

  /**
   * Add change event handler on path.
   * @param {string} moldPath - full path in mold
   * @param {function} userHandler
   */
  addListener(moldPath, userHandler) {
    const wrapperHandler = (event) => {
      if (event.path == moldPath) userHandler(event);
    };

    // Save listener
    if (!this._handlers[moldPath]) this._handlers[moldPath] = [];
    this._handlers[moldPath].push({
      wrapperHandler,
      userHandler,
    });

    // Add listener
    this._main.$$events.on('change', wrapperHandler);
  }

  /**
   * Add change event handler on path deeply.
   * It means it rises on each change of any child of any deep.
   * @param {string} moldPath - full path in mold
   * @param {function} userHandler
   */
  addDeepListener(moldPath, userHandler) {
    const wrapperHandler = (event) => {
      if (event.path.startsWith(moldPath)) userHandler(event);
    };

    // Save listener
    if (!this._handlers[moldPath]) this._handlers[moldPath] = [];
    this._handlers[moldPath].push({
      wrapperHandler,
      userHandler,
    });

    // Add listener
    this._main.$$events.on('change', wrapperHandler);
  }

  /**
   * Remove change event handler from path.
   * @param {string} moldPath - full path in mold
   * @param {function} handler
   */
  removeListener(moldPath, handler) {
    if (!this._handlers[moldPath]) return;

    let itemIndex;

    var found = _.find(this._handlers[moldPath], (item, index) => {
      if (item.userHandler === handler) {
        itemIndex = index;
        return item;
      }
    });

    if (!found) return;

    this._handlers[moldPath].splice(itemIndex, 1);
    if (!this._handlers[moldPath].length) {
      delete this._handlers[moldPath];
    }

    // Unbind listener
    this._main.$$events.removeListener('change', found.wrapperHandler);
  }

  destroyListeners(moldPath, deep = false) {
    // TODO: test it
    const clearing = (path) => {
      _.each(this._handlers[path], (item) => {
        this._main.$$events.removeListener('change', item.wrapperHandler);
      });
      this._handlers[path] = [];
    };

    if (deep) {
      _.each(this._handlers, (list, path) => {
        if (!path.startsWith(moldPath)) return;
        clearing(path);
      });
    }
    else {
      if (!this._handlers[moldPath]) return;
      clearing(moldPath);
    }
  }

  clear(moldPath) {
    // TODO: test it
    // TODO: должен поддержитьвать запросы документов - __responses
    this._storage.clear(moldPath);
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



    const _checkRecursively = function(path, value, childPath, childSchema) {
      if (childSchema.type) {
        // param
        let valuePath = childPath;
        if (path !== '') valuePath = childPath.replace(path + '.', '');

        const childValue = _.get(value, valuePath);

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
    const initialStorage = {};

    // Init storage. Collection's init behavior if different than in schema init.
    eachSchema(rawSchema, (path, value) => {
      //  convert from schema to lodash
      const moldPath = convertFromSchemaToLodash(path);
      if (value.type == 'document') {
        _.set(initialStorage, moldPath, {});

        // Go through inner param 'schema'
        //return 'schema';
      }
      else if (value.type == 'container') {
        _.set(initialStorage, moldPath, {});

        // Go through inner param 'schema'
        //return 'schema';
      }
      else if (value.type == 'documentsCollection') {
        _.set(initialStorage, moldPath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'pagedCollection') {
        _.set(initialStorage, moldPath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'collection') {
        _.set(initialStorage, moldPath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'array') {
        _.set(initialStorage, moldPath, []);

        // don't go deeper
        return false;
      }
      else if (_.includes(['boolean', 'string', 'number'], value.type)) {
        _.set(initialStorage, moldPath, null);

        // don't go deeper
        return false;
      }
    });

    return initialStorage;
  }

}
