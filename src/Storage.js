import _ from 'lodash';

//import { } from './helpers';
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

  $getWhoreStorageState() {
    return this._storage;
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

    return _.get(this._storage, path);
  }

  /**
   * Update value. It use _.defaultsDeep method.
   * This method deeply mutates existent object or arrays.
   * @param {string} path
   * @param {*} newValue
   */
  update(path, newValue) {
    // run mutates and get list of changes
    var changes = mutate(this._storage, path || '').update(newValue);
    // run update events
    this._riseEvents(changes);
  }

  /**
   * Add to beginning of collection
   * @param {string} pathToCollection - it must be a path to array in storage
   * @param {object} newItem
   */
  addToBeginning(pathToCollection, newItem) {
    var changes = mutate(this._storage, pathToCollection).addToBeginning(newItem);
    // run update events
    this._riseEvents(changes);
  }

  /**
   * Add to the end of collection
   * @param {string} pathToCollection - it must be a path to array in storage
   * @param {object} newItem
   */
  addToEnd(pathToCollection, newItem) {
    var changes = mutate(this._storage, pathToCollection).addToEnd(newItem);
    // run update events
    this._riseEvents(changes);
  }

  /**
   * Add page to paged collection
   * @param {string} pathToPagedCollection
   * @param {Array} page
   */
  addPage(pathToPagedCollection, page) {
    var collection = _.get(this._storage, pathToPagedCollection);

    collection.splice(collection.length, 0, page);

    var changes = [
      {
        path: pathToPagedCollection,
        action: 'add',
      }
    ];

    this._riseEvents(changes);
  }

  /**
   * Remove item from collection by its $index.
   * @param {string} pathToCollection
   * @param {number} $index
   */
  remove(pathToCollection, $index) {
    // TODO: наверное лучше принимать item а не index

    var changes = mutate(this._storage, pathToCollection).remove({$index});
    // run update events
    this._riseEvents(changes);
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

  _riseEvents(changes) {
    _.each(changes, (change) => {
      this._events.emit('mold.update', {
        path: change[0],
        action: change[1],
      });
    });
  }

}
