import _ from 'lodash';

import { convertFromLodashToMoldPath, convertToLodashPath } from './helpers';

class Mutate {
  constructor(storage, rootMold) {
    rootMold = rootMold || '';
    this.rootLodash = convertToLodashPath(rootMold);
    this.storage = storage;
    
    // it's list of all updates, like [moldPath, value, action]
    //     Action one of: changed, unchanged, deleted, added.
    this.updates = [];
  }

  update(newState) {
    this._crossroads(this.rootLodash, newState);
    return this.updates;
  }

  addToBeginning(newItem) {
    // TODO: !!!

    return this.updates;
  }

  _crossroads(rootLodash, newState) {
    if (_.isPlainObject(newState)) {
      return this._updateContainer(rootLodash, newState);
    }
    else if (_.isArray(newState) && newState.length > 0 && _.isPlainObject(_.head(newState))) {
      return this._updateCollection(rootLodash, newState);
    }
    else {
      // It's primitive or primitive array
      return this._updatePrimitive(rootLodash, newState);
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
    // события поднимаются на коллекции только если изменилось количество элементов
    // события поднимаются на элементе коллекции поднимаются только added, removed
    // события поднимаются на primitive элементов коллекции

    var isChanged = false;
    // remove whore source collection if new collection is empty
    if (newCollectionState.length === 0)
      return _.remove(_.get(this.storage, rootLodash));

    var originalCollection = _.get(this.storage, rootLodash);

    // remove useless items
    _.each(originalCollection, (value, index) => {
      if (_.isNil(value)) return;

       if (!newCollectionState[index]) {
        delete originalCollection[index];

        this.updates.push([convertFromLodashToMoldPath(this._makePath(rootLodash, index)), value, 'remove']);
        isChanged = true;
      }
    });

    //console.log(1111111, originalCollection)
    //console.log(22222222, newCollectionState)

    // updateArray
    _.each(newCollectionState, (value, index) => {
      if (_.isNil(value)) return;

      //console.log('++++>', index, value)

      if (originalCollection[index]) {
        // update existent item
        this._updateContainer(this._makePath(rootLodash, index), value);
        //var isItemChanged = this._updateContainer(this._makePath(rootLodash, index), value);
        //if (!isChanged) isChanged = isItemChanged;
        //console.log('=======>', this._makePath(rootLodash, index), value, originalCollection[index])
      }
      else {
        // add new item if it doesn't exist
        // It's rise event like push, but we can set item to its index
        // TODO: проверить можно ли устанавливать на любой индекс не по порядку
        //originalCollection.splice(originalCollection.length + 1, 1, value);
        originalCollection.splice(index, 1, value);
        //console.log('----->', index, value)
        this.updates.push([convertFromLodashToMoldPath(this._makePath(rootLodash, index)), value, 'add']);
        isChanged = true;
      }
    });

    //console.log(33333333, originalCollection)



    // remove empty values like undefined, null, etc.
    // TODO: после этой операции не отработают вотчеры массива - use collection.splice($index, 1);
    _.remove(originalCollection, (value) => !_.isPlainObject(value));




    this._updateIndexes(originalCollection);

    // rise update on whore collection
    var moldPath = convertFromLodashToMoldPath(rootLodash);
    var inStorage = (rootLodash) ? _.get(this.storage, rootLodash) : this.storage;
    if (isChanged) this.updates.push([moldPath, inStorage, 'changed']);
    //else this.updates.push([moldPath, inStorage, 'unchanged']);

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

  _updateIndexes(collectionInStorage) {
    _.each(collectionInStorage, (value, index) => {
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
 */
export default function(storage, rootMold) {
  return new Mutate(storage, rootMold);
}
