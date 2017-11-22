// It's runtime state manager
import _ from 'lodash';

import { findTheClosestParentPath, concatPath } from './helpers';
import Request from './Request';


export default class State {
  init(main, storage) {
    this._main = main;
    this._storage = storage;
    // TODO: сделать общим в main
    this.$$request = new Request(this._main);
    this._handlers = {};

    this._storage.$init({});
  }

  /**
   * Get storage data by path
   * @param {string} moldPath
   * @param {string} action
   * @returns {*} - value from mold
   */
  getState(moldPath, action) {
    return this._storage.getState(moldPath, action);
  }

  getMeta(moldPath, metaPath, action) {
    this._storage.getMeta(moldPath, metaPath, action);
  }

  initStorageIfNeed(moldPath) {
    this._storage.initNodeIfNeed(moldPath)
  }

  updateTopLevel(moldPath, partialData, action) {
    // TODO: check data - it has to consist with schema
    // TODO: ??? add eventData
    this._storage.updateTopLevel(moldPath, _.cloneDeep(partialData), action);
  }

  updateTopLevelSilent(moldPath, partialData, action) {
    // TODO: check data - it has to consist with schema
    // TODO: ??? add eventData
    this._storage.updateTopLevelSilent(moldPath, _.cloneDeep(partialData), action);
  }

  setBottomLevel(moldPath, newData, action) {
    // TODO: check data - it has to consist with schema
    // TODO: ??? add eventData

    this._storage.updateTopLevel(moldPath, _.cloneDeep(newData), action);
  }

  updateMeta(moldPath, partialData, action) {
    this._storage.updateMeta(moldPath, _.cloneDeep(partialData), action);
  }







  /**
   * Set to storage silently
   * @param {string} storagePath
   * @param {*} value - valid value
   */
  // setSilent(storagePath, value) { this._storage.setSilent(storagePath, value) }
  // // these methods are only wrappers of storage's methods
  // update(...params) { this._storage.update(...params) }
  // updateSilent(...params) { this._storage.updateSilent(...params) }
  // unshift(...params) { this._storage.unshift(...params) }
  // push(...params) { this._storage.push(...params) }
  // storageEmit(...params) { this._storage.emit(...params) }
  // storageEmitSilent(...params) { this._storage.emitSilent(...params) }
  // clear(storagePath) { this._storage.clear(storagePath) }


  // /**
  //  * Remove item from collection.
  //  * @param {string} storagePath
  //  * @param {object} itemToRemove
  //  * @param {object|undefined} eventData - additional data to event
  //  */
  // remove(storagePath, itemToRemove, eventData=undefined) {
  //   if (!_.isNumber(itemToRemove.$index)) {
  //     this._main.$$log.fatal(`Deleted item must has an $index param.`);
  //   }
  //
  //   this._storage.remove(storagePath, itemToRemove.$index, eventData);
  // }

  // /**
  //  * Set page to paged collection in store.
  //  * It doesn't mark items as unsaved.
  //  * @param {string} storagePath
  //  * @param {Array} page
  //  * @param {number} pageNum. It's required.
  //  * @param {object|undefined} eventData - additional data to event
  //  */
  // setPage(storagePath, page, pageNum, eventData=undefined) {
  //   this._storage.addTo(storagePath, page, pageNum, eventData);
  // }
  //
  // /**
  //  * Set undefined instead page. It doesn't reduce pagedCollection length.
  //  * @param {string} storagePath
  //  * @param pageNum
  //  * @param {object|undefined} eventData - additional data to event
  //  */
  // removePage(storagePath, pageNum, eventData=undefined) {
  //   this._storage.update(concatPath(storagePath, pageNum), undefined, eventData);
  // }

  /**
   * Add change event handler on path.
   * @param {string} storagePath
   * @param {function} userHandler
   * @param {boolean} anyChange
   */
  addListener(storagePath, userHandler, anyChange=false) {
    // TODO: review
    // TODO: правильней наверное использовать mold path
    const wrapperHandler = (event) => {
      if (event.storagePath == storagePath) userHandler(event);
    };

    const eventName = (anyChange) ? 'anyChange' : 'change';
    this._addListener(storagePath, userHandler, wrapperHandler, eventName);
  }

  /**
   * Add change event handler on path deeply.
   * It means it rises on each change of any child of any deep.
   * @param {string} storagePath
   * @param {function} userHandler
   * @param {boolean} anyChange
   */
  addDeepListener(storagePath, userHandler, anyChange=false) {
    const wrapperHandler = (event) => {
      if (event.storagePath.startsWith(storagePath)) userHandler(event);
    };

    const eventName = (anyChange) ? 'anyChange' : 'change';
    this._addListener(storagePath, userHandler, wrapperHandler, eventName);
  }

  /**
   * Remove change event handler from path.
   * @param {string} storagePath
   * @param {function} handler
   */
  removeListener(storagePath, handler) {
    // TODO: почему так сложно???
    if (!this._handlers[storagePath]) return;

    let itemIndex = -1;

    const found = _.find(this._handlers[storagePath], (item, index) => {
      if (item.userHandler === handler) {
        itemIndex = index;
        return item;
      }
    });

    if (!found) return;

    this._handlers[storagePath].splice(itemIndex, 1);
    if (!this._handlers[storagePath].length) {
      delete this._handlers[storagePath];
    }

    // Unbind listener
    this._main.$$events.off('change', found.wrapperHandler);
    this._main.$$events.off('anyChange', found.wrapperHandler);
  }

  /**
   * Remove all listeners on path.
   * @param storagePath
   * @param deep
   */
  destroyListeners(storagePath, deep=false) {
    // TODO: почему так сложно???
    const clearing = (path) => {
      _.each(this._handlers[path], (item) => {
        this._main.$$events.off('change', item.wrapperHandler);
        this._main.$$events.off('anyChange', item.wrapperHandler);
      });
      this._handlers[path] = [];
    };

    if (deep) {
      _.each(this._handlers, (list, path) => {
        if (!path.startsWith(storagePath)) return;
        clearing(path);
      });
    }
    else {
      if (!this._handlers[storagePath]) return;
      clearing(storagePath);
    }
  }

  _addListener(storagePath, userHandler, wrapperHandler, eventName) {
    // Save listener
    if (!this._handlers[storagePath]) this._handlers[storagePath] = [];
    this._handlers[storagePath].push({
      wrapperHandler,
      userHandler,
    });

    // Add listener
    this._main.$$events.on(eventName, wrapperHandler);
  }

}
