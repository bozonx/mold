import _ from 'lodash';

import { convertToCompositionPath } from './helpers';
import events from './events';

export default class Composition {
  constructor() {
    this._storage = {};
  }


  /**
   * Get value from compositon.
   * It hopes a path is correct
   * To get root you can pass '' or undefined to a path
   * @param {string} path - absolute path
   * @returns {*} - value by path
   */
  get(path) {
    // TODO: maybe return immutable?

    if (!path) return this._storage;

    return _.get(this._storage, convertToCompositionPath(path));
  }

  /**
   * Checks for storage has a value
   * If you pass '' to a path, it means root and returns true
   * @param {string} path - absolute path
   * @returns {boolean}
   */
  has(path) {
    if (path === '') return true;

    return _.has(this._storage, convertToCompositionPath(path));
  }

  /**
   * Set value to composition
   * It hopes a path and a value are correct.
   * It create or update value on the path.
   * To set to root you can pass '' or undefined to a path
   * @param {string} path - absolute path or ''
   * @param {*} value - new value
   */
  set(path, value) {
    if (!path)
      return this._storage = value;

    _.set(this._storage, convertToCompositionPath(path), value);

    // Rise an event
    events.emit('mold.composition.update', {path: path});
  }

  /**
   * Add new item to collection.
   * The primary id is index in an array in composition.
   * @param {string} pathToCollection
   * @param {string|number} primaryId
   * @param {object} newItem
   */
  add(pathToCollection, primaryId, newItem) {
    var collection = this.get(pathToCollection);

    var preparedItem = {
      ...newItem,
      $primary: primaryId,
    };

    if (collection) {
      collection[primaryId] = preparedItem;
    }
    else {
      let collection = [];
      collection[primaryId] = preparedItem;
      this.set(pathToCollection, collection);
    }

    // Rise an event
    events.emit('mold.composition.update', {path: path});
  }

  /**
   * Remove item from collection by its primary id.
   * It hopes primary id is equal to index in an array in composition.
   * @param {string} pathToCollection
   * @param {string|number} primaryId
   */
  remove(pathToCollection, primaryId) {
    var collection = this.get(pathToCollection);

    if (!collection) return;

    var newCollection = _.filter(collection, (value, name) => {return name !== primaryId});
    this.set(pathToCollection, newCollection);

    // Rise an event
    events.emit('mold.composition.update', {path: path});
  }

  find(pathToCollection, params) {
    // TODO: !!!!
  }

  filter(pathToCollection, params) {
    // TODO: !!!!
  }

}
