import _ from 'lodash';

import { splitPath } from './helpers';
import { convertToCompositionPath } from './helpers';
import events from './events';

export default class Composition {
  constructor() {
    this._storage = {};
  }


  /**
   * Get value from compositon.
   * It hopes a path is correct
   * To get root you can pass '' or undefined to a path
   * @param {string} path - absolute path
   * @returns {*} - value by path
   */
  get(path) {
    // TODO: maybe return immutable?

    if (!path) return this._storage;

    return _.get(this._storage, convertToCompositionPath(path));
  }

  /**
   * Checks for storage has a value
   * If you pass '' to a path, it means root and returns true
   * @param {string} path - absolute path
   * @returns {boolean}
   */
  has(path) {
    if (path === '') return true;

    return _.has(this._storage, convertToCompositionPath(path));
  }

  /**
   * Set value to composition
   * It hopes a path and a value are correct.
   * It create or update value on the path.
   * To set to root you can pass '' or undefined to a path
   * @param {string} path - absolute path or ''
   * @param {*} value - new value
   */
  set(path, value) {
    if (!path)
      return this._storage = value;

    _.set(this._storage, convertToCompositionPath(path), value);

    // Rise an event
    events.emit('mold.composition.update', {path: path});
  }

  /**
   * Add new item to collection.
   * The primary id is index in an array in composition.
   * @param {string} pathToCollection
   * @param {string|number} primaryId
   * @param {object} newItem
   */
  add(pathToCollection, primaryId, newItem) {
    var collection = this.get(pathToCollection);

    var preparedItem = {
      ...newItem,
      $primary: primaryId,
    };

    if (collection) {
      collection[primaryId] = preparedItem;
    }
    else {
      let collection = [];
      collection[primaryId] = preparedItem;
      this.set(pathToCollection, collection);
    }

    // Rise an event
    events.emit('mold.composition.update', {path: path});
  }

  /**
   * Remove item from collection by its primary id.
   * It hopes primary id is equal to index in an array in composition.
   * @param {string} pathToCollection
   * @param {string|number} primaryId
   */
  remove(pathToCollection, primaryId) {
    var collection = this.get(pathToCollection);

    if (!collection) return;

    var newCollection = _.filter(collection, (value, name) => {return name !== primaryId});
    console.log(333333333, newCollection)
    this.set(pathToCollection, newCollection);

    // Rise an event
    events.emit('mold.composition.update', {path: path});
  }

  find(pathToCollection, params) {
    // TODO: !!!!
  }

  filter(pathToCollection, params) {
    // TODO: !!!!
  }


  //
  // /**
  //  * Get value from compositon.
  //  * It hopes a path is correct
  //  * To get root you can pass '' or undefined to a path
  //  * @param {string} path - absolute path
  //  * @returns {*} - value by path
  //  */
  // get(path) {
  //   // TODO: maybe return immutable?
  //
  //   if (!path) return this._storage;
  //
  //   // TODO: как узнать имя primary key?
  //   var convertedPath = this._convertPrimaryToIndexesInPath(this._storage, path, 'id');
  //
  //   return _.get(this._storage, convertedPath);
  // }
  //
  // /**
  //  * Checks for storage has a value
  //  * If you pass '' to a path, it means root and returns true
  //  * @param {string} path - absolute path
  //  * @returns {boolean}
  //  */
  // has(path) {
  //   if (path === '') return true;
  //
  //   // TODO: как узнать имя primary key?
  //   var convertedPath = this._convertPrimaryToIndexesInPath(this._storage, path, 'id');
  //
  //   return _.has(this._storage, convertedPath);
  //  }
  //
  // /**
  //  * Set value to composition
  //  * It hopes a path and a value are correct.
  //  * It create or update value on the path.
  //  * To set to root you can pass '' or undefined to a path
  //  * @param {string} path - absolute path or ''
  //  * @param {*} value - new value
  //  */
  // set(path, value) {
  //   if (!path)
  //     return this._storage = value;
  //
  //   if (path.match(/\{\d+}/)) {
  //     // collection
  //
  //     // TODO: как узнать имя primary key?
  //     var primaryKeyName = 'id';
  //
  //     var parsed = parseCollectionPath(path);
  //
  //     var convertedCompositonPath = this._convertPrimaryToIndexesInPath(this._storage, parsed.collectionPath, primaryKeyName);
  //     if (!convertedCompositonPath)
  //       throw new Error(`You can't set to collection which not exists in composition.`);
  //
  //     var collection = _.get(this._storage, convertedCompositonPath);
  //     if (!collection) {
  //       // new collection
  //       _.set(this._storage, _.trim(`${convertedCompositonPath}[0].${parsed.collectionItemPath}`), value);
  //     }
  //     else {
  //       // existent collection
  //       var index = _.findIndex(collection, {[primaryKeyName]: parsed.itemPrimary});
  //       _.set(this._storage, _.trim(`${convertedCompositonPath}[${index}].${parsed.collectionItemPath}`), value);
  //     }
  //   }
  //   else {
  //     // container or leaf
  //     _.set(this._storage, path, value);
  //   }
  //
  // }
  //
  // /**
  //  * It converts path with primary keys like "one{1}.two" to
  //  * path with index like "one[1].two".
  //  * If item with primary key isn't exiting an the moment, it returns undefined.
  //  * @param storage
  //  * @param path
  //  * @param primaryKeyName
  //  * @returns {string}
  //  * @private
  //  */
  // _convertPrimaryToIndexesInPath(storage, path, primaryKeyName) {
  //   var splitted = splitPath(path);
  //   var convertedPath = '';
  //
  //   _.find(splitted, (pathPart) => {
  //     if (!_.eq(parseInt(pathPart), NaN)) {
  //       // collection item
  //       var numPathPart = parseInt(pathPart);
  //
  //       var itemIndex;
  //       var collectionOnCurrentPath = _.get(storage, convertedPath);
  //       var item = _.find(collectionOnCurrentPath, (value, index) => {
  //         if (value[primaryKeyName] === numPathPart) {
  //           itemIndex = index;
  //           return true;
  //         }
  //       });
  //
  //       if (_.isUndefined(collectionOnCurrentPath) || !item) {
  //         convertedPath = undefined;
  //         return true;
  //       }
  //
  //       if (convertedPath === '') convertedPath = `[${itemIndex}]`;
  //       else convertedPath = `${convertedPath}[${itemIndex}]`;
  //     }
  //     else {
  //       // container child
  //
  //       if (convertedPath === '') convertedPath = pathPart;
  //       else convertedPath = `${convertedPath}.${pathPart}`;
  //     }
  //   });
  //
  //   return convertedPath;
  // }
}
