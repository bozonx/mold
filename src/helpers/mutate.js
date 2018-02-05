import _ from 'lodash';

import { concatPath, isCollection } from './helpers';

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
      if (newState.length === 0) {
        return this._cleanArray(root);
      }
      else if (isCollection(newState)) {
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
    const currentContainer = this._get(root);

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
      const newArray = _.cloneDeep(newPrimitiveArrayState);

      _.set(this.storage, root, newArray);

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
   * @private
   */
  _updateCollection(root, newCollectionState) {
    const originalCollection = this._get(root);

    if (_.isUndefined(originalCollection)) {
      const newCollection = _.cloneDeep(newCollectionState);

      _.set(this.storage, root, newCollection);

      return;
    }

    const items = [];

    _.each(newCollectionState, (item) => {
      if (!_.isPlainObject(item)) return;
      if (!_.isNumber(item.$$key)) {
        // TODO: использовать app.log
        console.warn(`WARNING: item doesn't have a $$key param! ${JSON.stringify(item)}`);

        return;
      }

      const found = _.find(originalCollection, {$$key: item.$$key});

      if (found) {
        // existent item - update it
        // TODO: mutate
        const mutated = item;

        items.push(mutated);
      }
      else {
        // new items
        items.push(item);
      }
    });

    // set to old collection
    _.each(items, (item, index) => {
      originalCollection.splice(index, 1, item);
    });

    this._removeOddFromRight(originalCollection, newCollectionState);
  }

  _removeOddFromRight(originalArray, newArray) {
    if (!originalArray.length || !newArray.length || newArray.length > originalArray.length) return;
    originalArray.splice(newArray.length, originalArray.length - newArray.length);
  }

  _get(root) {
    if (!root) {
      return this.storage;
    }
    
    return _.get(this.storage, root);
    
  }

}
