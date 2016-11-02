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
   */
  update(newState) {
    this._crossroads(this.root, newState);
  }

  /**
   * Add item to beginning of collection
   * @param {object} newItem
   */
  addToBeginning(newItem) {
    if (!newItem) return;

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

    if (!newItem) return;

    var collection = _.get(this.storage, this.root);

    // add to beginning
    collection.splice(collection.length, 0, newItem);

    this._updateIndexes(collection);
  }

  /**
   * Remove item from collection
   * @param {object} item
   */
  remove(item) {
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
    else if (_.isArray(newState) && newState.length > 0 && _.isPlainObject(_.head(newState))) {
      return this._updateCollection(root, newState);
    }
    else if (_.isArray(newState) && !newState.length) {
      // It's primitive array or empty collection
      return this._updatePrimitiveArray(root, newState);
    }
    else {
      // It's primitive, one of boolean, string, number of null
      return this._updatePrimitive(root, newState);
    }
  }

  _updateContainer(root, newContainerState) {
    var isChanged = false;
    // TODO: refactor - use reduce
    _.each(newContainerState, (value, name) => {
      var isItemChanged = this._crossroads(concatPath(root, name), value);
      if (!isChanged) isChanged = isItemChanged;
    });

    return isChanged;
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

  _updatePrimitive(root, newPrimitiveState) {
    var oldValue = _.get(this.storage, root);
    // set to storage
    _.set(this.storage, root, newPrimitiveState);

    var isChanged = oldValue !== newPrimitiveState;

    return isChanged;
  }

  _updatePrimitiveArray(root, newPrimitiveArrayState) {
    // TODO: test it
    var originalArray = _.get(this.storage, root);
    var isChanged = !_.isEqual(originalArray, newPrimitiveArrayState);
    if (!isChanged) return false;

    // clear old array
    // TODO: надо поднять событие
    // TODO: надо удалять только лишние элементы, так как те что от начала и так заменятся
    _.remove(originalArray);

    _.each(newPrimitiveArrayState, (value, index) => {
      originalArray.splice(index, 1, value);
    });

    return isChanged;
  }

  // _makePath(root, child) {
  //   if (_.isNumber(child)) {
  //     // Path form collection item
  //     return `${root}[${child}]`;
  //   }
  //   // Path for containers and primitives
  //   return _.trim(`${root}.${child}`, '.');
  // }

  _updateIndexes(collectionInStorage) {
    _.each(collectionInStorage, (value, index) => {
      if (_.isPlainObject(value)) value.$index = index;
    });
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
