import _ from 'lodash';

import { concatPath } from './helpers';

class Mutate {
  constructor(storage, rootLodash = '') {
    this.root = rootLodash;
    this.storage = storage;
  }

  /**
   * Update container/collection/primitive with new state.
   * WARNING: If you add item to beginning of existent collection
   *     it means - update all items and add last item
   * @param {*} newState
   * @returns {boolean} true if there were any changes.
   */
  update(newState) {
    return this._crossroads(this.root, newState);
  }

  /**
   * Add item to beginning of collection
   * @param {object} newItem
   */
  addToBeginning(newItem) {
    if (!newItem) return;

    // TODO: наверное вынести в Storage

    var collection = _.get(this.storage, this.root);

    // add to beginning
    collection.splice(0, 0, newItem);

    this._updateIndexes(collection);
  }

  /**
   * Add item to end of collection
   * @param {object} newItem
   */
  addToEnd(newItem) {

    // TODO: test it

    // TODO: наверное вынести в Storage

    if (!newItem) return;

    var collection = _.get(this.storage, this.root);

    // add to beginning
    collection.splice(collection.length, 0, newItem);

    this._updateIndexes(collection);
  }

  /**
   * Add item specified index of collection
   * @param {object} newItem
   * @param {number} index
   */
  addTo(newItem, index) {

    // TODO: test it

    // TODO: наверное вынести в Storage

    if (!newItem) return;
    if (!_.isNumber(index)) return;

    var collection = _.get(this.storage, this.root);

    collection[index] = null;
    collection.splice(index, 1, newItem);

    this._updateIndexes(collection);
  }

  /**
   * Remove item from collection
   * @param {object} item
   */
  remove(item) {
    // TODO: наверное вынести в Storage

    if (!item) return;
    if (!_.isNumber(item.$index)) throw new Error(`Remove from collection: item must have an $index param. ${item}`);

    var collection = _.get(this.storage, this.root);

    // remove with rising an change event on array of collection
    collection.splice(item.$index, 1);

    this._updateIndexes(collection);
  }

  _crossroads(root, newState) {
    if (_.isPlainObject(newState)) {
      return this._updateContainer(root, newState);
    }
    else if (_.isArray(newState)) {
      if (newState.length === 0) {
        return this._cleanArray(root);
      }
      // TODO: оптимизировать проверку - compact возможно много жрет ресурсов
      else if (newState.length && _.isPlainObject(_.head(_.compact(newState)))) {
        return this._updateCollection(root, newState);
      }
      else if (newState.length) {
        // It's primitive array or empty collection
        return this._updatePrimitiveArray(root, newState);
      }
    }
    else {
      // It's primitive, one of boolean, string, number of null
      return this._updatePrimitive(root, newState);
    }
  }

  _updateContainer(root, newContainerState) {
    return _.reduce(newContainerState, (sum, value, name) => {
      var haveChanges = this._crossroads(concatPath(root, name), value);
      return !sum && haveChanges;
    }, false);
  }

  _updatePrimitive(root, newPrimitiveState) {
    var oldValue = _.get(this.storage, root);
    // set to storage
    _.set(this.storage, root, newPrimitiveState);
    return oldValue !== newPrimitiveState;
  }

  _cleanArray(root) {
    var originalArray = _.get(this.storage, root);

    if (_.isEmpty(originalArray)) return false;

    originalArray.splice(0);

    return true;
  }

  /**
   * It carefully replace old array with new array.
   * @param root
   * @param newPrimitiveArrayState
   * @returns {boolean}
   * @private
   */
  _updatePrimitiveArray(root, newPrimitiveArrayState) {
    var originalArray = _.get(this.storage, root);
    if (_.isEqual(originalArray, newPrimitiveArrayState)) return false;

    _.each(newPrimitiveArrayState, (value, index) => {
      originalArray.splice(index, 1, value);
    });

    // Remove odd items from right
    if (originalArray.length && newPrimitiveArrayState.length &&
        newPrimitiveArrayState.length < originalArray.length) {
      originalArray.splice(originalArray.length - 1, newPrimitiveArrayState.length - 1);
    }

    return true;
  }

  _updateCollection(root, newCollectionState) {
    var isChanged = false;
    // remove whore source collection if new collection is empty
    if (newCollectionState.length === 0)
      return _.remove(_.get(this.storage, root));

    var originalCollection = _.get(this.storage, root);

    // remove useless items
    _.each(originalCollection, (value, index) => {
      if (_.isNil(value)) return;

      if (!newCollectionState[index]) {
        // remove with rising an change event on array of collection
        originalCollection.splice(index, 1);

        isChanged = true;
      }
    });

    // updateArray
    _.each(newCollectionState, (value, index) => {
      if (_.isNil(value)) return;

      if (originalCollection[index]) {
        // update existent item
        this._updateContainer(concatPath(root, index), value);
        //var isItemChanged = this._updateContainer(this._makePath(root, index), value);
        //if (!isChanged) isChanged = isItemChanged;
      }
      else {
        // add new item if it doesn't exist
        // It's rise event like push, but we can set item to its index
        // TODO: проверить можно ли устанавливать на любой индекс не по порядку
        //originalCollection.splice(originalCollection.length + 1, 1, value);
        originalCollection.splice(index, 1, value);

        isChanged = true;
      }
    });

    // remove empty values like undefined, null, etc.
    // TODO: после этой операции не отработают вотчеры массива - use collection.splice($index, 1);
    _.remove(originalCollection, (value) => !_.isPlainObject(value));

    this._updateIndexes(originalCollection);

    return isChanged;
  }

  _updateIndexes(collectionInStorage) {
    if (_.isArray(_.last(collectionInStorage))) {
      // for paged collections
      _.each(collectionInStorage, (page) => {
        _.each(page, (value, index) => {
          if (_.isPlainObject(value)) value.$index = index;
        });
      });
    }
    else {
      // for simple collections
      _.each(collectionInStorage, (value, index) => {
        if (_.isPlainObject(value)) value.$index = index;
      });
    }
  }
}

/**
 * Mutate storage.
 * @param {object|Array} storage - This will be mutate
 * @param {string} rootLodash - It's root path in mold format like 'path.to.0.item'
 */
export default function(storage, rootLodash) {
  return new Mutate(storage, rootLodash);
}
