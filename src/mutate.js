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
    // TODO: зачем '' ?
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

  _updateContainer(rootLodash, newData) {
    var isChanged = false;
    // TODO: refactor - use reduce
    _.each(newData, (value, name) => {
      var isItemChanged = this._crossroads(this._makePath(rootLodash, name), value);
      if (!isChanged) isChanged = isItemChanged;
    });

    var moldPath = convertFromLodashToMoldPath(rootLodash);
    var inStorage = _.get(this.storage, rootLodash);
    if (isChanged) this.updates.push([moldPath, inStorage, 'changed']);
    else this.updates.push([moldPath, inStorage, 'unchanged']);

    return isChanged;
  }

  _updateCollection(rootLodash, newData) {
    var isChanged = false;
    // remove whore source collection if new collection is empty
    if (newData.length === 0)
      return _.remove(_.get(this.storage, rootLodash));

    var oldCollection = _.get(this.storage, rootLodash);

    // remove useless items
    _.each(oldCollection, (value, index) => {
      if (_.isNil(value)) return;

      if (!newData[index]) {
        delete oldCollection[index];
        this.updates.push([convertFromLodashToMoldPath(this._makePath(rootLodash, index)), value, 'deleted']);
        isChanged = true;
      }
    });

    // updateArray
    _.each(newData, (value, index) => {
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
        this.updates.push([convertFromLodashToMoldPath(this._makePath(rootLodash, index)), value, 'added']);
        isChanged = true;
      }
    });

    // remove empty values like undefined, null, etc.
    // TODO: после этой операции не отработают вотчеры массива
    _.remove(oldCollection, (value) => !_.isPlainObject(value));

    var moldPath = convertFromLodashToMoldPath(rootLodash);
    var inStorage = _.get(this.storage, rootLodash);
    if (isChanged) this.updates.push([moldPath, inStorage, 'changed']);
    else this.updates.push([moldPath, inStorage, 'unchanged']);

    return isChanged;
  }

  _updatePrimitive(rootLodash, newData) {
    var oldValue = _.get(this.storage, rootLodash);
    _.set(this.storage, rootLodash, newData);

    var isChanged = oldValue !== newData;

    if (isChanged) this.updates.push([convertFromLodashToMoldPath(rootLodash), newData, 'changed']);
    else this.updates.push([convertFromLodashToMoldPath(rootLodash), newData, 'unchanged']);

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
}

/**
 * Mutate object or array.
 * @param {object|array} storage - This will be mutate
 * @param {string} rootMold - It's root path in mold format like 'path.to.0.item'
 * @param {object|array} newData - This is new data
 * @param {function} onUpdate - update handler
 */
export default function(storage, rootMold, newData, onUpdate) {
  var mutate = new Mutate(storage);
  mutate.mutate(rootMold, newData, onUpdate);

  return mutate.updates;
}
