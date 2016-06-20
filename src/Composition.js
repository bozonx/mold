import _ from 'lodash';

import { splitPath } from './helpers';

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

    // TODO: как узнать имя primary key?
    var convertedPath = this._convertPrimaryToIndexesInPath(this._storage, path, 'id');

    console.log(1111111111, convertedPath)
    
    return _.get(this._storage, convertedPath);

    //return _.get(this._storage, path);
  }

  /**
   * Checks for storage has a value
   * If you pass '' to a path, it means root and returns true
   * @param {string} path - absolute path
   * @returns {boolean}
   */
  has(path) {
    if (path === '') return true;
    return _.has(this._storage, path);
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

    // TODO: запрещенно устанавливать значение, если путь вида 'one{1}.two{2}' и данные в {1} не определенны

    if (!path) {
      return this._storage = value;
    }
    else {
      _.set(this._storage, path, value);
    }
  }

  /**
   * It converts path with primary keys like "one{1}.two" to
   * path with index like "one[1].two".
   * If item with primary key isn't exiting an the moment, it returns undefined.
   * @param storage
   * @param path
   * @param primaryKeyName
   * @returns {string}
   * @private
   */
  _convertPrimaryToIndexesInPath(storage, path, primaryKeyName) {
    var splitted = splitPath(path);
    var convertedPath = '';

    _.find(splitted, (pathPart) => {
      if (!_.eq(parseInt(pathPart), NaN)) {
        // collection item
        var numPathPart = parseInt(pathPart);

        var itemIndex;
        var collectionOnCurrentPath = _.get(storage, convertedPath);
        var item = _.find(collectionOnCurrentPath, (value, index) => {
          if (value[primaryKeyName] === numPathPart) {
            itemIndex = index;
            return true;
          }
        });

        if (_.isUndefined(collectionOnCurrentPath) || !item) {
          convertedPath = undefined;
          return true;
        }

        if (convertedPath === '') convertedPath = `[${itemIndex}]`;
        else convertedPath = `${convertedPath}[${itemIndex}]`;
      }
      else {
        // container child

        if (convertedPath === '') convertedPath = pathPart;
        else convertedPath = `${convertedPath}.${pathPart}`;
      }
    });

    return convertedPath;
  }
}
