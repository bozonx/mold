import _ from 'lodash';

import { concatPath } from './helpers';
import { mutate, updateIndexes } from './mutate';

export default class Storage {
  constructor(events, log) {
    this._events = events;
    this._log = log;
    this._storage = null;
  }

  /**
   * Set new storage.
   * This method runs one time from State.js.
   * Don't run it from your application.
   * @param {object} newStorage
   */
  $init(newStorage) {
    this._storage = newStorage;
  }

  $getWholeStorageState() {
    return this._storage;
  }

  /**
   * Get value from the storage.
   * It hopes a path is correct
   * To get root you can pass '' or undefined to a path
   * @param {string} storagePath - absolute path in storage
   * @returns {*} - value by path
   */
  get(storagePath) {
    if (!storagePath) return this._storage;

    return _.get(this._storage, storagePath);
  }

  /**
   * Update container or collection.
   * This method deeply mutates existent object or arrays.
   * It rises an event only if were any changes
   * @param {string} storagePath
   * @param {*} newValue
   * @param {object|undefined} eventData - additional data to event
   */
  update(storagePath, newValue, eventData=undefined) {
    // run mutates and get list of changes
    var wereChanges = mutate(this._storage, storagePath).update(newValue);

    // run update event
    if (wereChanges) {
      this._riseUserChange(storagePath, 'change', eventData);
      this._riseAnyChange(storagePath, 'change', eventData);
    }

    return wereChanges;
  }

  /**
   * Update container or collection silently without rising an event.
   * @param {string} storagePath
   * @param {*} newValue
   * @param {object|undefined} eventData - additional data to event
   * @return {bool} wereChanges
   */
  updateSilent(storagePath, newValue, eventData=undefined) {
    // run mutates and get list of changes
    var wereChanges =  mutate(this._storage, storagePath).update(newValue);

    if (wereChanges) {
      this._riseSilentChange(storagePath, 'change', eventData);
      this._riseAnyChange(storagePath, 'change', eventData);
    }

    return wereChanges;
  }

  /**
   * It set data to storage silently. It just replace data, it doesn't update it!
   * @param {string} storagePath
   * @param {*} newValue
   */
  setSilent(storagePath, newValue) {
    _.set(this._storage, storagePath, newValue);
    this._riseSilentChange(storagePath, 'change');
    this._riseAnyChange(storagePath, 'change');
  }

  /**
   * Emit an event
   * @param {string} storagePath
   * @param {string} action - 'change', 'add' etc.
   * @param {object|undefined} eventData - additional data to event
   */
  emit(storagePath, action='change', eventData=undefined) {
    this._riseUserChange(storagePath, action, eventData);
    this._riseAnyChange(storagePath, action, eventData);
  }

  /**
   * Emit an event silently
   * @param {string} storagePath
   * @param {string} action - 'change', 'add' etc.
   * @param {object|undefined} eventData - additional data to event
   */
  emitSilent(storagePath, action='change', eventData=undefined) {
    this._riseUserChange(storagePath, action, eventData);
    this._riseAnyChange(storagePath, action, eventData);
  }

  /**
   * Add to beginning of collection
   * It rises an event any way.
   * @param {string} storagePathToCollection - it must be a path to array in storage.
   * @param {object} newItem
   * @param {object|undefined} eventData - additional data to event
   */
  unshift(storagePathToCollection, newItem, eventData=undefined) {
    if (!_.isObject(newItem)) return;
    const collection = this.get(storagePathToCollection);

    if (!_.isArray(collection)) this._log.fatal(`Collection isn't an array "${storagePathToCollection}"`);

    // add to beginning
    collection.splice(0, 0, newItem);

    let pageIndex = storagePathToCollection.replace(/.*\[(\d+)]$/, '$1');
    pageIndex = _.toNumber(pageIndex);
    updateIndexes(collection, pageIndex);

    // run update event
    this._riseUserChange(storagePathToCollection, 'add', eventData);
    this._riseAnyChange(storagePathToCollection, 'add', eventData);
  }

  /**
   * Add to the end of collection
   * @param {string} storagePathToCollection - it must be a path to array in storage
   * @param {object} newItem
   * @param {object|undefined} eventData - additional data to event
   */
  push(storagePathToCollection, newItem, eventData=undefined) {
    const collection = this.get(storagePathToCollection);
    if (!_.isArray(collection)) this._log.fatal(`Collection isn't an array "${storagePathToCollection}"`);
    this.addTo(storagePathToCollection, newItem, collection.length, eventData);
  }

  /**
   * Add item specified index of collection.
   * It rises an event if item adds to the end or it update existent item and changes were registered.
   * @param {string} storagePathToCollection - it must be a path to array in storage
   * @param {object} newItem
   * @param {number} index
   * @param {object|undefined} eventData - additional data to event
   */
  addTo(storagePathToCollection, newItem, index, eventData=undefined) {
    if (!_.isObject(newItem)) return;
    if (!_.isNumber(index)) return;
    const collection = this.get(storagePathToCollection);
    if (!_.isArray(collection)) this._log.fatal(`Collection isn't an array "${storagePathToCollection}"`);
    const oldCollectionLength = collection.length;

    let pageIndex = storagePathToCollection.replace(/.*\[(\d+)]$/, '$1');
    pageIndex = _.toNumber(pageIndex);

    if (index + 1 > oldCollectionLength) {
      // add to the end
      // extend array
      collection[index] = null;
      collection.splice(index, 1, newItem);
      updateIndexes(collection, pageIndex);
      // run update event
      this._riseUserChange(storagePathToCollection, 'add', eventData);
      this._riseAnyChange(storagePathToCollection, 'add', eventData);
    }
    else {
      // change existent item
      const wereChanges = mutate(this._storage, concatPath(storagePathToCollection, index)).update(newItem);
      updateIndexes(collection, pageIndex);
      if (wereChanges) {
        this._riseUserChange(storagePathToCollection, 'change', eventData);
        this._riseAnyChange(storagePathToCollection, 'change', eventData);
      }
    }
  }

  /**
   * Remove item from collection by its $index.
   * After it, array will reduce.
   * @param {string} storagePathToCollection
   * @param {number} $index
   * @param {object|undefined} eventData - additional data to event
   */
  remove(storagePathToCollection, $index, eventData=undefined) {
    if (!_.isNumber($index)) return;
    const collection = this.get(storagePathToCollection);
    if (!_.isArray(collection)) this._log.fatal(`Collection isn't an array "${storagePathToCollection}"`);

    if ($index > collection.length - 1) return;

    // remove with rising an change event on array of collection
    collection.splice($index, 1);
    updateIndexes(collection);
    // run update event
    this._riseUserChange(storagePathToCollection, 'remove', eventData);
    this._riseAnyChange(storagePathToCollection, 'remove', eventData);
  }

  /**
   * Clear storage on path. But it doesn't remove container or array itself.
   * @param {string} storagePathToCollection
   * @param {object|undefined} eventData - additional data to event
   */
  clear(storagePathToCollection, eventData=undefined) {
    const containerOrArray = _.get(this._storage, storagePathToCollection);
    if (_.isEmpty(containerOrArray)) return;

    this._clearRecursive(containerOrArray);
    this._riseUserChange(storagePathToCollection, 'change', eventData);
    this._riseAnyChange(storagePathToCollection, 'change', eventData);
  }

  /**
   * Clear container or array recursively.
   * @param {object|array} value
   * @private
   */
  _clearRecursive(value) {
    if (_.isArray(value)) {
      value.splice(0);
    }
    else if (_.isPlainObject(value)) {
      // container
      _.each(value, (containerItem, name) => {
        if (!_.isObject(containerItem)) {
          delete value[name];
        }
        else {
          this._clearRecursive(containerItem);
        }
      });
    }
  }

  _riseUserChange(storagePath, action, eventData) {
    this._events.emit('change', _.omitBy({
      storagePath,
      action,
      data: eventData,
    }, _.isUndefined));
  }
  _riseAnyChange(storagePath, action, eventData) {
    this._events.emit('anyChange', _.omitBy({
      storagePath,
      action,
      data: eventData,
    }, _.isUndefined));
  }
  _riseSilentChange(storagePath, action, eventData) {
    this._events.emit('silentChange', _.omitBy({
      storagePath,
      action,
      data: eventData,
    }, _.isUndefined));
  }

}
