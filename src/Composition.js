import _ from 'lodash';

import { convertToLodashPath } from './helpers';
import mutate from './mutate';
//import bubbling from './bubbling';

export default class Composition {
  constructor(events) {
    this._events = events;
    this._storage = {};

    // this._events.on('mold.update', (event) => {
    //   this._events.emit('mold.change::' + event.path, {
    //
    //   })
    // });
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

  /**
   * Update value. It use _.defaultsDeep method.
   * This method deeply mutates existent object or arrays.
   * @param moldPath
   * @param value
     */
  update(moldPath, value) {
    // run mutates
    var changes = mutate(this._storage, moldPath || '', value);

    // run update events
    _.each(changes, (change) => {
      this._events.emit('mold.update', {
        path: change[0],
        action: change[2],
      });
    });

    // run events emiting
    //bubbling(this._events, moldPath, 'mold.update', changes);
  }

  /**
   * Add to beginning of collection
   * @param {string} pathToCollection - it must be a path to array in composition
   * @param {object} newItem
   */
  addToBeginning(pathToCollection, newItem) {
    var collection = _.get(this._storage, convertToLodashPath(pathToCollection));
    //collection = [].concat(collection);

    // add to beginning
    collection.unshift(newItem);

    // TODO: use update()
    //this.update(pathToCollection, collection);

    // // Rise an event
    this._events.emit('mold.update', {
      path: pathToCollection,
      action: 'add',
    });
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
    //collection = [].concat(collection);


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
