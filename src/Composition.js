import _ from 'lodash';

import { convertToLodashPath } from './helpers';
import mutate from './mutate';
import bubbling from './bubbling';

export default class Composition {
  constructor(events) {
    this._events = events;
    this._storage = {};
  }

  $initAll(values) {
    this._storage = values;
  }

  /**
   * Get value from compositon.
   * It hopes a path is correct
   * To get root you can pass '' or undefined to a path
   * @param {string} path - absolute path
   * @returns {*} - value by path
   */
  get(path) {
    if (!path) return this._storage;

    return _.get(this._storage, convertToLodashPath(path));
  }

  // /**
  //  * Checks for storage has a value
  //  * If you pass '' to a path, it means root and returns true
  //  * @param {string} path - absolute path
  //  * @returns {boolean}
  //  */
  // has(path) {
  //   if (path === '') return true;
  //
  //   return _.has(this._storage, convertToCompositionPath(path));
  // }

  /**
   * Update value. It use _.defaultsDeep method.
   * This method deeply mutates existent object or arrays.
   * @param moldPath
   * @param value
     */
  update(moldPath, value) {
    var changes = mutate(this._storage, moldPath || '', value);

    bubbling(this._events, moldPath, 'mold.update', changes);

    // TODO: remove
    _.each(changes, (value) => {
      this._updateHandler(...value);
    });
  }

  _updateHandler(moldPath, value, action) {
    // Don't rise an event if value haven't been changed
    if (action == 'unchanged') return;

    this._events.emit('mold.composition.update', {
      path: moldPath,
      action,
      value,
    });
  }

  /**
   * Add to beginning of collection
   * @param {string} pathToCollection - it must be a path to array in composition
   * @param {object} newItem
   */
  addToBeginning(pathToCollection, newItem) {
    var collection = _.get(this._storage, convertToLodashPath(pathToCollection));
    // add to beginning
    collection.unshift(newItem);
    // Rise an event
    this._events.emit('mold.composition.update', {path: pathToCollection});
    this._updateIndexes(pathToCollection);
  }

  /**
   * Remove item from collection by its primary id.
   * It hopes primary id is equal to index in an array in composition.
   * @param {string} pathToCollection
   * @param {number} $index
   */
  remove(pathToCollection, $index) {
    var collection = _.get(this._storage, convertToLodashPath(pathToCollection));

    // remove with rising an change event on array of collection
    collection.splice($index, 1);

    // Rise an event
    this._events.emit('mold.composition.update', {path: pathToCollection});
    this._updateIndexes(pathToCollection);
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
