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
   * @param {string} path - absolute path
   * @returns {*} - value by path
   */
  get(path) {
    if (!path) return this._storage;

    return _.get(this._storage, path);
  }

  /**
   * Update container or collection.
   * This method deeply mutates existent object or arrays.
   * It rises an event only if were any changes
   * @param {string} path
   * @param {*} newValue
   */
  update(path, newValue) {
    // run mutates and get list of changes
    var wereChanges = mutate(this._storage, path).update(newValue);

    // run update event
    if (wereChanges) this._riseEvents(path, 'change');
  }

  /**
   * It set data to storage silently. It just replace data, it doesn't update it!
   * @param {string} path
   * @param {*} newValue
   */
  setSilent(path, newValue) {
    _.set(this._storage, path, newValue);
  }

  /**
   * Emit an event
   * @param {string} path
   * @param {string} action - 'change', 'add' etc.
   */
  emit(path, action='change') {
    this._riseEvents(path, action);
  }

  /**
   * Add to beginning of collection
   * It rises an event any way.
   * @param {string} pathToCollection - it must be a path to array in storage.
   * @param {object} newItem
   */
  unshift(pathToCollection, newItem) {
    if (!_.isObject(newItem)) return;
    const collection = this.get(pathToCollection);

    if (!_.isArray(collection)) this._log.fatal(`Collection isn't an array "${pathToCollection}"`);

    // add to beginning
    collection.splice(0, 0, newItem);

    let pageIndex = pathToCollection.replace(/.*\[(\d+)]$/, '$1');
    pageIndex = _.toNumber(pageIndex);
    updateIndexes(collection, pageIndex);

    // run update event
    this._riseEvents(pathToCollection, 'add');
  }

  /**
   * Add to the end of collection
   * @param {string} pathToCollection - it must be a path to array in storage
   * @param {object} newItem
   */
  push(pathToCollection, newItem) {
    const collection = this.get(pathToCollection);
    if (!_.isArray(collection)) this._log.fatal(`Collection isn't an array "${pathToCollection}"`);
    this.addTo(pathToCollection, newItem, collection.length);
  }

  /**
   * Add item specified index of collection.
   * It rises an event if item adds to the end or it update existent item and changes were registered.
   * @param {string} pathToCollection - it must be a path to array in storage
   * @param {object} newItem
   * @param {number} index
   */
  addTo(pathToCollection, newItem, index) {
    if (!_.isObject(newItem)) return;
    if (!_.isNumber(index)) return;
    const collection = this.get(pathToCollection);
    if (!_.isArray(collection)) this._log.fatal(`Collection isn't an array "${pathToCollection}"`);
    const oldCollectionLength = collection.length;

    let pageIndex = pathToCollection.replace(/.*\[(\d+)]$/, '$1');
    pageIndex = _.toNumber(pageIndex);

    if (index + 1 > oldCollectionLength) {
      // add to the end
      // extend array
      collection[index] = null;
      collection.splice(index, 1, newItem);
      updateIndexes(collection, pageIndex);
      // run update event
      this._riseEvents(pathToCollection, 'add');
    }
    else {
      // change existent item
      const wereChanges = mutate(this._storage, concatPath(pathToCollection, index)).update(newItem);
      updateIndexes(collection, pageIndex);
      if (wereChanges) this._riseEvents(pathToCollection, 'change');
    }
  }

  /**
   * Remove item from collection by its $index.
   * After it, array will reduce.
   * @param {string} pathToCollection
   * @param {number} $index
   */
  remove(pathToCollection, $index) {
    if (!_.isNumber($index)) return;
    const collection = this.get(pathToCollection);
    if (!_.isArray(collection)) this._log.fatal(`Collection isn't an array "${pathToCollection}"`);

    if ($index > collection.length - 1) return;

    // remove with rising an change event on array of collection
    collection.splice($index, 1);
    updateIndexes(collection);
    // run update event
    this._riseEvents(pathToCollection, 'remove');
  }

  /**
   * Clear storage on path. But it doesn't remove container or array itself.
   * @param {string} storagePath
   */
  clear(storagePath) {
    const containerOrArray = _.get(this._storage, storagePath);
    if (_.isEmpty(containerOrArray)) return;

    this._clearRecursive(containerOrArray);
    this._riseEvents(storagePath, 'change');
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

  _riseEvents(path, action) {
    this._events.emit('change', {
      path,
      // TODO: переименовать
      //storagePath: path,
      action,
    });
  }

}
