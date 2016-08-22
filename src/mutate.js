import _ from 'lodash';

import { convertFromLodashToMoldPath, convertToLodashPath } from './helpers';

class Mutate {
  constructor(storage) {
    this.storage = storage;
    // it's list of all updates, like [moldPath, value, action]
    //     Action one of: changed, unchanged, deleted, added.
    this.updates = [];
  }

  mutate(rootMold, newData) {
    rootMold = rootMold || '';
    var rootLodash = convertToLodashPath(rootMold);

    return this._crossroads(rootLodash, newData);
  }

  _crossroads(rootLodash, newData) {
    if (_.isPlainObject(newData)) {
      return this._updateContainer(rootLodash, newData);
    }
    else if (_.isArray(newData) && newData.length > 0 && _.isPlainObject(_.head(newData))) {
      return this._updateCollection(rootLodash, newData);
    }
    else {
      // It's primitive
      return this._updatePrimitive(rootLodash, newData);
    }
  }

  _updateContainer(rootLodash, newContainerState) {
    var isChanged = false;
    // TODO: refactor - use reduce
    _.each(newContainerState, (value, name) => {
      var isItemChanged = this._crossroads(this._makePath(rootLodash, name), value);
      if (!isChanged) isChanged = isItemChanged;
    });

    // var moldPath = convertFromLodashToMoldPath(rootLodash);
    // var inStorage = (rootLodash) ? _.get(this.storage, rootLodash) : this.storage;
    // if (isChanged) this.updates.push([moldPath, inStorage, 'changed']);
    // else this.updates.push([moldPath, inStorage, 'unchanged']);

    return isChanged;
  }

  _updateCollection(rootLodash, newCollectionState) {
    var isChanged = false;
    // remove whore source collection if new collection is empty
    if (newCollectionState.length === 0)
      return _.remove(_.get(this.storage, rootLodash));

    var oldCollection = _.get(this.storage, rootLodash);

    // remove useless items
    _.each(oldCollection, (value, index) => {
      if (_.isNil(value)) return;

      if (!newCollectionState[index]) {
        delete oldCollection[index];
        this.updates.push([convertFromLodashToMoldPath(this._makePath(rootLodash, index)), value, 'remove']);
        isChanged = true;
      }
    });

    // updateArray
    _.each(newCollectionState, (value, index) => {
      if (_.isNil(value)) return;

      if (oldCollection[index]) {
        // update existent item
        var isItemChanged = this._updateContainer(this._makePath(rootLodash, index), value);
        if (!isChanged) isChanged = isItemChanged;
      }
      else {
        // add new item if it doesn't exist
        // It's rise event like push, but we can set item to its index
        // TODO: проверить можно ли устанавливать на любой индекс не по порядку
        //oldCollection.splice(oldCollection.length + 1, 1, value);
        oldCollection.splice(index, 1, value);
        this.updates.push([convertFromLodashToMoldPath(this._makePath(rootLodash, index)), value, 'add']);
        isChanged = true;
      }
    });

    // remove empty values like undefined, null, etc.
    // TODO: после этой операции не отработают вотчеры массива - use collection.splice($index, 1);
    _.remove(oldCollection, (value) => !_.isPlainObject(value));

    this._updateIndexes(oldCollection);

    // var moldPath = convertFromLodashToMoldPath(rootLodash);
    // var inStorage = (rootLodash) ? _.get(this.storage, rootLodash) : this.storage;
    // if (isChanged) this.updates.push([moldPath, inStorage, 'changed']);
    // else this.updates.push([moldPath, inStorage, 'unchanged']);

    return isChanged;
  }

  _updatePrimitive(rootLodash, newPrimitiveState) {
    var oldValue = _.get(this.storage, rootLodash);
    _.set(this.storage, rootLodash, newPrimitiveState);

    var isChanged = oldValue !== newPrimitiveState;

    if (isChanged) this.updates.push([convertFromLodashToMoldPath(rootLodash), newPrimitiveState, 'change']);
    else this.updates.push([convertFromLodashToMoldPath(rootLodash), newPrimitiveState, 'unchanged']);

    return isChanged;
  }

  _makePath(rootLodash, child) {
    if (_.isNumber(child)) {
      // Path form collection item
      return `${rootLodash}[${child}]`;
    }
    // Path for containers and primitives
    return _.trim(`${rootLodash}.${child}`, '.');
  }

  _updateIndexes(ollectionInStorage) {
    _.each(ollectionInStorage, (value, index) => {
      // skip empty items. Because indexes are primary ids. In collection may be empty items before real item
      //if (!value) return;
      value.$index = index;
    });
  }

}

/**
 * Mutate storage.
 * @param {object|array} storage - This will be mutate
 * @param {string} rootMold - It's root path in mold format like 'path.to.0.item'
 * @param {object|array} newData - This is new data
 */
export default function(storage, rootMold, newData) {
  var mutate = new Mutate(storage);
  mutate.mutate(rootMold, newData);

  return mutate.updates;
}
