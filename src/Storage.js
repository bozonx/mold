import _ from 'lodash';

import { concatPath } from './helpers';
import { mutate, updateIndexes } from './mutate';

export default class Storage {
  constructor(events) {
    this._events = events;
    this._storage = null;
    this._responses = null;
  }

  /**
   * Set new storage.
   * This method runs one time from State.js.
   * Don't run it from your application.
   * @param {object} newStorage
   */
  $init(newStorage) {
    this._storage = newStorage;
    // TODO: может придумать получше место для их хранения???
    this._storage.__responses = {};
    this._responses = this._storage.__responses;
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

  initResponse(url, initial) {
    if (_.isUndefined(this._responses[url])) {
      this._responses[url] = initial;
    }

    return this._responses[url];
  }

  getResponse(url) {
    return this._responses[url];
  }

  updateResponse(url, newValue) {
    // var wereChanges;
    // // run mutates and get list of changes
    // if (!this._responses[url]) {
    //   this._responses[url] = newValue;
    //   wereChanges = true;
    // }
    // else {
    //   wereChanges = mutate(this._responses[url], '').update(newValue);
    // }

    let wereChanges = mutate(this._responses[url]).update(newValue);

    //_.extend(this._responses[url], newValue)

    // run update event
    //if (wereChanges) this._riseEvents(url, 'change');
  }

  clearResponse(url) {
    delete this._responses[url];
  }

  /**
   * Add to beginning of collection
   * It rises an event any way.
   * @param {string} pathToCollection - it must be a path to array in storage.
   * @param {object} newItem
   */
  unshift(pathToCollection, newItem) {
    if (!_.isObject(newItem)) return;
    var collection = this.get(pathToCollection);

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
    var collection = this.get(pathToCollection);
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
    var collection = this.get(pathToCollection);
    var oldCollectionLength = collection.length;

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
      let wereChanges = mutate(this._storage, concatPath(pathToCollection, index)).update(newItem);
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
    var collection = this.get(pathToCollection);

    if ($index > collection.length - 1) return;

    // remove with rising an change event on array of collection
    collection.splice($index, 1);
    updateIndexes(collection);
    // run update event
    this._riseEvents(pathToCollection, 'remove');
  }

  /**
   * Clear storage on path. But it doesn't remove container or array itself.
   * @param path
   */
  clear(path) {
    var containerOrArray = _.get(this._storage, path);
    var isItEmpty = _.isEmpty(containerOrArray);

    this._clearRecursive(containerOrArray);
    if (!isItEmpty) this._riseEvents(path, 'change');
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
          _.set(value, name, null);
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
      action,
    });
  }

}
