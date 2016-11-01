import _ from 'lodash';

//import {  } from './helpers';

class Mutate {
  constructor(storage, rootMold) {
    rootMold = rootMold || '';
    this.rootLodash = rootMold;
    this.storage = storage;

    // it's list of all updates, like [moldPath, value, action]
    //     Action one of: changed, unchanged, remove, add.
    this.changes = [];
  }

  /**
   * Update container/collection/primitive with new state.
   * WARNING: If you add item to beginning of existent collection
   *     it means - update all items and add last item
   * @param {*} newState
   * @returns {Array} changes
   */
  update(newState) {
    this._crossroads(this.rootLodash, newState);

    return this.changes;
  }

  /**
   * Add item to beginning of collection
   * @param {object} newItem
   * @returns {Array} changes
   */
  addToBeginning(newItem) {
    if (!newItem) return this.changes;

    var collection = _.get(this.storage, this.rootLodash);

    // add to beginning
    collection.splice(0, 0, newItem);

    this.changes.push([this.rootLodash, 'change']);
    this.changes.push([this._makePath(this.rootLodash, 0), 'add']);

    this._updateIndexes(collection);

    return this.changes;
  }

  /**
   * Add item to end of collection
   * @param {object} newItem
   * @returns {Array} changes
   */
  addToEnd(newItem) {

    // TODO: test it

    if (!newItem) return this.changes;

    var collection = _.get(this.storage, this.rootLodash);

    // add to beginning
    collection.splice(collection.length, 0, newItem);

    this.changes.push([this.rootLodash, 'change']);
    this.changes.push([this._makePath(this.rootLodash, 0), 'add']);

    this._updateIndexes(collection);

    return this.changes;
  }

  /**
   * Remove item from collection
   * @param {object} item
   * @returns {Array} changes
   */
  remove(item) {
    if (!item) return this.changes;
    if (!_.isNumber(item.$index)) throw new Error(`Remove from collection: item must have an $index param. ${item}`);

    var collection = _.get(this.storage, this.rootLodash);

    // remove with rising an change event on array of collection
    collection.splice(item.$index, 1);

    this.changes.push([this.rootLodash,  'change']);
    this.changes.push([this._makePath(this.rootLodash, item.$index), 'remove']);

    this._updateIndexes(collection);

    return this.changes;
  }

  _crossroads(rootLodash, newState) {
    if (_.isPlainObject(newState)) {
      return this._updateContainer(rootLodash, newState);
    }
    else if (_.isArray(newState) && newState.length > 0 && _.isPlainObject(_.head(newState))) {
      return this._updateCollection(rootLodash, newState);
    }
    else if (_.isArray(newState) && !newState.length) {
      // It's primitive array or empty collection
      return this._updatePrimitiveArray(rootLodash, newState);
    }
    else {
      // It's primitive, one of boolean, string, number of null
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
        // remove with rising an change event on array of collection
        originalCollection.splice(index, 1);

        this.changes.push([this._makePath(rootLodash, index), value, 'remove']);
        isChanged = true;
      }
    });

    // updateArray
    _.each(newCollectionState, (value, index) => {
      if (_.isNil(value)) return;

      if (originalCollection[index]) {
        // update existent item
        this._updateContainer(this._makePath(rootLodash, index), value);
        //var isItemChanged = this._updateContainer(this._makePath(rootLodash, index), value);
        //if (!isChanged) isChanged = isItemChanged;
      }
      else {
        // add new item if it doesn't exist
        // It's rise event like push, but we can set item to its index
        // TODO: проверить можно ли устанавливать на любой индекс не по порядку
        //originalCollection.splice(originalCollection.length + 1, 1, value);
        originalCollection.splice(index, 1, value);
        this.changes.push([this._makePath(rootLodash, index), 'add']);
        isChanged = true;
      }
    });

    // remove empty values like undefined, null, etc.
    // TODO: после этой операции не отработают вотчеры массива - use collection.splice($index, 1);
    _.remove(originalCollection, (value) => !_.isPlainObject(value));

    this._updateIndexes(originalCollection);

    // rise update on whore collection
    var moldPath = rootLodash;
    if (isChanged) this.changes.push([moldPath, 'change']);
    //else this.changes.push([moldPath, 'unchanged']);

    return isChanged;
  }

  _updatePrimitive(rootLodash, newPrimitiveState) {
    var oldValue = _.get(this.storage, rootLodash);
    // set to storage
    _.set(this.storage, rootLodash, newPrimitiveState);

    var isChanged = oldValue !== newPrimitiveState;

    if (isChanged) this.changes.push([rootLodash, 'change']);
    else this.changes.push([rootLodash, 'unchanged']);

    return isChanged;
  }

  _updatePrimitiveArray(rootLodash, newPrimitiveArrayState) {
    // TODO: test it
    var originalArray = _.get(this.storage, rootLodash);
    var isChanged = !_.isEqual(originalArray, newPrimitiveArrayState);
    if (!isChanged) return false;

    // clear old array
    // TODO: надо поднять событие
    // TODO: надо удалять только лишние элементы, так как те что от начала и так заменятся
    _.remove(originalArray);

    _.each(newPrimitiveArrayState, (value, index) => {
      originalArray.splice(index, 1, value);
    });

    if (isChanged) this.changes.push([rootLodash, 'change']);
    else this.changes.push([rootLodash, 'unchanged']);

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
