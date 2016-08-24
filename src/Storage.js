import _ from 'lodash';

import { convertToLodashPath } from './helpers';
import mutate from './mutate';

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

  /**
   * Get value from storage.
   * It hopes a path is correct
   * To get root you can pass '' or undefined to a path
   * @param {string} path - absolute path
   * @returns {*} - value by path
   */
  get(path) {
    if (!path) return this._storage;

    return _.get(this._storage, convertToLodashPath(path));
  }

  /**
   * Update value. It use _.defaultsDeep method.
   * This method deeply mutates existent object or arrays.
   * @param {string} moldPath
   * @param {*} newValue
   */
  update(moldPath, newValue) {
    // run mutates and get list of changes
    var changes = mutate(this._storage, moldPath || '', newValue);

    // run update events
    _.each(changes, (change) => {
      this._events.emit('mold.update', {
        path: change[0],
        action: change[2],
      });
    });
  }

  /**
   * Add to beginning of collection
   * @param {string} pathToCollection - it must be a path to array in storage
   * @param {object} newItem
   */
  addToBeginning(pathToCollection, newItem) {
    // TODO: use update()
    var collection = _.get(this._storage, convertToLodashPath(pathToCollection));
    var collectionClone = _.cloneDeep(collection);

    collectionClone.unshift(newItem);

    this.update(pathToCollection, collectionClone);

    // var collection = _.get(this._storage, convertToLodashPath(pathToCollection));
    // // add to beginning
    // collection.unshift(newItem);
    //
    // // // Rise an event
    // this._events.emit('mold.update', {
    //   path: pathToCollection,
    //   action: 'add',
    // });
    // this._updateIndexes(pathToCollection);
  }

  /**
   * Remove item from collection by its $index.
   * @param {string} pathToCollection
   * @param {number} $index
   */
  remove(pathToCollection, $index) {
    var collection = _.get(this._storage, convertToLodashPath(pathToCollection));

    // remove with rising an change event on array of collection
    collection.splice($index, 1);

    // TODO: use update()
    //this.update(pathToCollection, collection);

    // // Rise an event
    this._events.emit('mold.update', {
      path: pathToCollection,
      action: 'remove',
    });
    this._updateIndexes(pathToCollection);
  }

  /**
   * Clear storage on path
   * @param moldPath
   */
  clear(moldPath) {
    var contents = _.get(this._storage, moldPath);

    var clearRecursive = (value, localPath) => {
      if (_.isArray(value)) {
        _.remove(value);
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

  _updateIndexes(pathToCollection) {
    // TODO: unused
    var collection = _.get(this._storage, convertToLodashPath(pathToCollection));
    _.each(collection, (value, index) => {
      // skip empty items. Because indexes are primary ids. In collection may be empty items before real item
      if (!value) return;
      value.$index = index;
    });
  }

}
