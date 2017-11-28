import _ from 'lodash';

import { concatPath } from './helpers';

/**
 * Mutate storage.
 * @param {object|Array} storage - This will be mutated
 * @param {string} rootLodash - It's root path in mold format like 'path.to.0.item'
 */
export function mutate(storage, rootLodash = '') {
  return new Mutate(storage, rootLodash);
}

class Mutate {
  constructor(storage, rootLodash) {
    this.storage = storage;
    this.root = rootLodash;
  }

  /**
   * Update container/collection/primitive with new state.
   * For correctly update collection set unique $$key param.
   * @param {*} newState
   */
  combine(newState) {
    return this._crossroads(this.root, newState);
  }

  _crossroads(root, newState) {
    if (_.isPlainObject(newState)) {
      return this._updateContainer(root, newState);
    }
    else if (_.isArray(newState)) {
      const compactedArray = _.compact(newState);
      if (newState.length === 0) {
        return this._cleanArray(root);
      }
      else if ( _.isPlainObject(_.head(compactedArray))
        &&  _.isNumber(_.head(compactedArray).$$key)) {
        return this._updateCollection(root, newState);
      }
      else {
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
    // remove odd params
    const currentContainer = this._get(root);;

    _.each(currentContainer, (item, name) => {
      if (_.isUndefined(newContainerState[name])) {
        delete currentContainer[name];
      }
    });

    // update
    _.each(newContainerState, (item, name) => {
      const path = concatPath(root, name);
      this._crossroads(path, item);
    });
  }

  _updatePrimitive(root, newPrimitiveState) {
    _.set(this.storage, root, newPrimitiveState);
  }

  _cleanArray(root) {
    const originalArray = this._get(root);

    console.log(11111, root, originalArray)

    if (_.isEmpty(originalArray)) return;

    originalArray.splice(0);
  }

  /**
   * It carefully replace old array with new array.
   * @param root
   * @param newPrimitiveArrayState
   * @private
   */
  _updatePrimitiveArray(root, newPrimitiveArrayState) {
    let originalArray = this._get(root);

    if (_.isEqual(originalArray, newPrimitiveArrayState)) return;

    if (_.isUndefined(originalArray)) {
      _.set(this.storage, root, newPrimitiveArrayState);

      return;
    }

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
    let isChanged = false;
    let originalCollection = this._get(root);

    // TODO: переделать - порядок элементов бедем из новых данных
    //       - ищем по primaryKey старые элементы, и берем из старых элементов данные, на которые накладываем новые
    //       !!!! или может вообще всегда заменять массивы, чтобы не было путаницы

    if (_.isUndefined(originalCollection)) {
      originalCollection = _.cloneDeep(newCollectionState);
      _.set(this.storage, root, originalCollection);
      isChanged = true;
    }
    else {
      // update each item
      _.each(newCollectionState, (value, index) => {
        if (_.isPlainObject(value)) {
          // update item
          const isItemChanged = this._updateContainer(concatPath(root, index), value);
          if (!isChanged) isChanged = isItemChanged;
        }
        else {
          // replace item to undefined
          const isItemChanged = originalCollection[index] !== value;
          if (!isChanged) isChanged = isItemChanged;
          originalCollection.splice(index, 1, value);
        }
      });
      if (isChanged) this._removeOddFromRight(originalCollection, newCollectionState);
    }

    if (isChanged) updateIndexes(originalCollection);
    return isChanged;
  }

  _removeOddFromRight(originalArray, newArray) {
    if (!originalArray.length || !newArray.length || newArray.length > originalArray.length) return;
    originalArray.splice(newArray.length, originalArray.length - newArray.length);
  }

  _get(root) {
    if (!root) {
      return this.storage;
    }
    else {
      return _.get(this.storage, root);
    }
  }

}
