import _ from 'lodash';

import { concatPath } from './helpers';

export function updateIndexes(collectionInStorage) {
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

/**
 * Mutate storage.
 * @param {object|Array} storage - This will be mutate
 * @param {string} rootLodash - It's root path in mold format like 'path.to.0.item'
 */
export function mutate(storage, rootLodash) {
  return new Mutate(storage, rootLodash);
}

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
      return (!sum) ? haveChanges : sum;
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
    this._removeOddFromRight(originalArray, newPrimitiveArrayState);

    return true;
  }

  /**
   * Update collection. It replaces it with new values.
   * It hopes newCollectionState isn't empty.
   * @param root
   * @param newCollectionState
   * @returns {boolean}
   * @private
   */
  _updateCollection(root, newCollectionState) {
    var isChanged = false;
    var originalCollection = _.get(this.storage, root);

    // update each item
    _.each(newCollectionState, (value, index) => {
      if (_.isPlainObject(value)) {
        // update item
        let isItemChanged = this._updateContainer(concatPath(root, index), value);
        if (!isChanged) isChanged = isItemChanged;
      }
      else {
        // replace item to undefined
        let isItemChanged = originalCollection[index] !== value;
        if (!isChanged) isChanged = isItemChanged;
        originalCollection.splice(index, 1, value);
      }
    });

    this._removeOddFromRight(originalCollection, newCollectionState);
    updateIndexes(originalCollection);
    return isChanged;
  }

  _removeOddFromRight(originalArray, newArray) {
    if (!originalArray.length || !newArray.length || newArray.length > originalArray.length) return;
    originalArray.splice(newArray.length, originalArray.length - newArray.length);
  }

}
