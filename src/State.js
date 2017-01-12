// It's runtime state manager
import _ from 'lodash';

import { findTheClosestParentPath, concatPath } from './helpers';
import Request from './Request';


export default class State {
  init(main, storage) {
    this._main = main;
    this._storage = storage;
    this.$$request = new Request(this._main);
    this._handlers = {};
    this._urlParams = {};

    this._storage.$init({});
  }

  /**
   * Get parameters for url path template.
   * @param {string} moldPath
   * @returns {object}
   */
  getUrlParams(moldPath) {
    if (this._urlParams[moldPath]) return this._urlParams[moldPath];

    // For primitives - find the closest parent
    const closestParentPath = findTheClosestParentPath(moldPath, this._urlParams);

    return this._urlParams[closestParentPath];
  }

  /**
   * Set parameters for url path template.
   * @param {string} moldPath
   * @param {object} params
   */
  setUrlParams(moldPath, params) {
    this._urlParams[moldPath] = params;
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
   * @param {string} moldPath
   * @param {string} storagePath
   * @param {*} value - valid value
   */
  update(moldPath, storagePath, value) {
    this._checkNode(moldPath, value);

    this._storage.update(storagePath, value);
  }

  /**
   * Set to mold silently
   * @param {string} storagePath
   * @param {*} value - valid value
   */
  setSilent(storagePath, value) {
    this._storage.setSilent(storagePath, value);
  }

  /**
   * Add to beginning of a collection in store by user action.
   * It add item as is, not clones it.
   * @param {string} moldPath
   * @param {string} storagePath
   * @param {object} newItem
   * @param {number|undefined} pageNum
   */
  unshift(moldPath, storagePath, newItem, pageNum = undefined) {
    // // It rise an error if path doesn't consist with schema
    // const schema = this._main.$$schemaManager.get(moldPath);
    //
    // // TODO: перенести это в checkNode
    // if (!_.includes(['collection', 'pagedCollection', 'documentsCollection'], schema.type))
    //   this._main.$$log.fatal(`You can add new item only to collection!`);

    this._checkNode(moldPath, newItem);

    const path = (_.isNumber(pageNum)) ? concatPath(storagePath, pageNum) : storagePath;
    this._storage.unshift(path, newItem);
  }

  /**
   * Add to end of collection in store by user action.
   * It add item as is, not clones it.
   * @param {string} moldPath
   * @param {string} storagePath
   * @param {object} newItem
   * @param {number|undefined} pageNum
   */
  push(moldPath, storagePath, newItem, pageNum = undefined) {
    // // It rise an error if path doesn't consist with schema
    // const schema = this._main.$$schemaManager.get(moldPath);
    //
    // // TODO: перенести это в checkNode
    // if (!_.includes(['collection', 'pagedCollection', 'documentsCollection'], schema.type))
    //   this._main.$$log.fatal(`You can add new item only to collection!`);

    this._checkNode(moldPath, newItem);

    const path = (_.isNumber(pageNum)) ? concatPath(storagePath, pageNum) : storagePath;
    this._storage.push(path, newItem);
  }

  /**
   * Remove item from collection.
   * @param {string} moldPath
   * @param {string} storagePath
   * @param {object} itemToRemove
   * @param {number|undefined} pageNum
   */
  remove(moldPath, storagePath, itemToRemove, pageNum = undefined) {
    // // It rise an error if path doesn't consist with schema
    // const schema = this._main.$$schemaManager.get(moldPath);
    //
    // if (!_.includes(['collection', 'pagedCollection', 'documentsCollection'], schema.type))
    //   this._main.$$log.fatal(`You can remove only from collection!`);

    if (!_.isNumber(itemToRemove.$index))
      this._main.$$log.fatal(`Deleted item must has an $index param.`);

    const path = (_.isNumber(pageNum)) ? concatPath(storagePath, pageNum) : storagePath;
    this._storage.remove(path, itemToRemove.$index);
  }

  /**
   * Set page to paged collection in store.
   * It doesn't mark items as unsaved.
   * @param {string} moldPath
   * @param {string} storagePath
   * @param {Array} page
   * @param {number} pageNum. It's required.
   */
  setPage(moldPath, storagePath, page, pageNum) {
    // // It rises an error if path doesn't consist with schema
    // const schema = this._main.$$schemaManager.get(moldPath);
    //
    // // TODO: перенести это в checkNode
    // if (schema.type !== 'pagedCollection' && schema.type !== 'documentsCollection')
    //   this._main.$$log.fatal(`You can add new item only to paged collection!`);

    const preparedPage = _.cloneDeep(page);

    this._storage.addTo(storagePath, preparedPage, pageNum);
  }

  /**
   * Set undefined instead page. It doesn't reduce pagedCollection length.
   * @param moldPath
   * @param {string} storagePath
   * @param pageNum
   */
  removePage(moldPath, storagePath, pageNum) {
    // // It rise an error if path doesn't consist with schema
    // const schema = this._main.$$schemaManager.get(moldPath);
    //
    // if (!_.includes(['pagedCollection', 'documentsCollection'], schema.type))
    //   this._main.$$log.fatal(`You can remove  page only from pagedCollection of documentsCollection!`);

    this._storage.update(concatPath(storagePath, pageNum), undefined);
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

    this._addListener(moldPath, userHandler, wrapperHandler);
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

    this._addListener(moldPath, userHandler, wrapperHandler);
  }

  /**
   * Remove change event handler from path.
   * @param {string} moldPath - full path in mold
   * @param {function} handler
   */
  removeListener(moldPath, handler) {
    if (!this._handlers[moldPath]) return;

    let itemIndex = -1;

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

  /**
   * Remove all listeners on path.
   * @param moldPath
   * @param deep
   */
  destroyListeners(moldPath, deep=false) {
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
    //this._storage.clear(moldPath);
  }


  _addListener(moldPath, userHandler, wrapperHandler) {
    // Save listener
    if (!this._handlers[moldPath]) this._handlers[moldPath] = [];
    this._handlers[moldPath].push({
      wrapperHandler,
      userHandler,
    });

    // Add listener
    this._main.$$events.on('change', wrapperHandler);
  }

  _checkNode(path, value, schema) {
    // TODO: do it - node has to consist to schema
  }

}
