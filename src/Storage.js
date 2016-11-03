import _ from 'lodash';

import { concatPath } from './helpers';
import { mutate, updateIndexes } from './mutate';

export default class Storage {
  constructor(events) {
    this._events = events;
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
   * Update value. It use _.defaultsDeep method.
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
   * Add to beginning of collection
   * It rises an event any way.
   * @param {string} pathToCollection - it must be a path to array in storage.
   * @param {object} newItem
   */
  addToBeginning(pathToCollection, newItem) {
    if (!_.isObject(newItem)) return;
    var collection = this.get(pathToCollection);

    // add to beginning
    collection.splice(0, 0, newItem);

    updateIndexes(collection);

    // run update event
    this._riseEvents(pathToCollection, 'add');
  }

  /**
   * Add to the end of collection
   * @param {string} pathToCollection - it must be a path to array in storage
   * @param {object} newItem
   */
  addToEnd(pathToCollection, newItem) {
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

    if (index + 1 > oldCollectionLength) {
      // add to the end
      // extend array
      collection[index] = null;
      collection.splice(index, 1, newItem);
      updateIndexes(collection);
      // run update event
      this._riseEvents(pathToCollection, 'add');
    }
    else {
      // change existent item
      let wereChanges = mutate(this._storage, concatPath(pathToCollection, index)).update(newItem);
      updateIndexes(collection);
      if (wereChanges) this._riseEvents(pathToCollection, 'change');
    }
  }

  /**
   * Remove item from collection by its $index.
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
   * Clear storage on path
   * @param moldPath
   */
  clear(moldPath) {
    // TODO: а события?? или может лучше mutate использовать?

    var contents = _.get(this._storage, moldPath);

    var clearRecursive = (value, localPath) => {
      if (_.isArray(value)) {
        //_.remove(value);
        value.splice(0);
      }
      else if (_.isPlainObject(value)) {
        _.each(value, (containerItem, name) => {
          clearRecursive(containerItem, localPath + '.' + name);
        });
      }
      else {
        if (localPath) {
          _.set(contents, localPath, null);
        }
        else {
          _.set(this._storage, moldPath, null);
        }
      }
    };

    clearRecursive(contents, '');
  }

  _riseEvents(path, action) {
    this._events.emit('change', {
      path,
      action,
    });
  }

}
