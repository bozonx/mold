import _ from 'lodash';

import { convertFromLodashToMoldPath, convertToLodashPath } from './helpers';

class Mutate {
  constructor(storage) {
    this.storage = storage;
    this.updates = [];
  }

  mutate(root, newData) {
    // TODO: зачем '' ?
    root = root || '';

    var isChanged = this._crossroads(convertFromLodashToMoldPath(root), newData);

    if (isChanged) this.updates.push([convertToLodashPath(root), newData, 'changed']);
    else this.updates.push([convertToLodashPath(root), newData, 'unchanged']);
  }

  _crossroads(root, newData) {
    if (_.isPlainObject(newData)) {
      return this.updateContainer(root, newData);
    }
    else if (_.isArray(newData) && newData.length > 0 && _.isPlainObject(_.head(newData))) {
      return this.updateCollection(root, newData);
    }
    else {
      // It's primitive
      return this.updatePrimitive(root, newData);
    }
  }

  updateContainer(root, newData) {
    var isChanged = false;
    // TODO: refactor - use reduce
    _.each(newData, (value, name) => {
      var isItemChanged = this._crossroads(this._makePath(root, name), value);
      if (!isChanged) isChanged = isItemChanged;
    });

    if (isChanged) this.updates.push([convertToLodashPath(root), newData, 'changed']);
    else this.updates.push([convertToLodashPath(root), newData, 'unchanged']);

    return isChanged;
  }

  updateCollection(root, newData) {
    var isChanged = false;
    // remove whore source collection if new collection is empty
    if (newData.length === 0)
      return _.remove(_.get(this.storage, root));

    var oldCollection = _.get(this.storage, root);

    // remove useless items
    _.each(oldCollection, (value, index) => {
      if (_.isNil(value)) return;

      if (!newData[index]) {
        delete oldCollection[index];
        this.updates.push([convertToLodashPath(this._makePath(root, index)), value, 'deleted']);
        isChanged = true;
      }
    });

    // updateArray
    _.each(newData, (value, index) => {
      if (_.isNil(value)) return;

      if (oldCollection[index]) {
        // update existent item
        var isItemChanged = this.updateContainer(this._makePath(root, index), value);
        if (!isChanged) isChanged = isItemChanged;
      }
      else {
        // add new item if it doesn't exist
        // It's rise event like push, but we can set item to its index
        // TODO: проверить можно ли устанавливать на любой индекс не по порядку
        oldCollection.splice(oldCollection.length + 1, 1, value);
        // TODO: надо устанавливать согласно primary key
        //oldCollection.splice(value.id, 1, value);
        this.updates.push([convertToLodashPath(this._makePath(root, index)), value, 'added']);
        isChanged = true;
      }
    });

    if (isChanged) this.updates.push([convertToLodashPath(root), newData, 'changed']);
    else this.updates.push([convertToLodashPath(root), newData, 'unchanged']);

    return isChanged;
  }

  updatePrimitive(root, newData) {
    var oldValue = _.get(this.storage, root);
    _.set(this.storage, root, newData);

    var isChanged = oldValue !== newData;

    if (isChanged) this.updates.push([convertToLodashPath(root), newData, 'changed']);
    else this.updates.push([convertToLodashPath(root), newData, 'unchanged']);

    return isChanged;
  }

  _makePath(root, child) {
    if (_.isNumber(child)) {
      // Path form collection item
      return `${root}[${child}]`;
    }
    // Path for containers and primitives
    return _.trim(`${root}.${child}`, '.');
  }
}

/**
 * Mutate object or array.
 * @param {object|array} storage - This will be mutate
 * @param {string} root - It's path like "path.to[0].any[1].child".
 *                        It uses lodash path format form functions _.get(), _.set() etc.
 * @param {object|array} newData - This is new data
 * @param {function} onUpdate - update handler
 */
export default function(storage, root, newData, onUpdate) {
  //mutate(storage, root, newData);
  var mutate = new Mutate(storage);
  mutate.mutate(root, newData, onUpdate);
  return mutate.updates;
}
