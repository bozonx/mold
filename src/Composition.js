import _ from 'lodash';

import { recursively, convertToCompositionPath, recursiveMutate } from './helpers';

export default class Composition {
  constructor(main) {
    this._main = main;
    this._storage = {};
  }

  $initAll(values) {
    this._storage = values;
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
   * WARNING: it replace object or error but doesn't replace existent them.
   * @param {string} path - absolute path or ''
   * @param {*} value - new value
   */
  set(path, value) {
    if (!path)
      return this._storage = value;

    // TODO: какое назначение этой ф-и теперь???? и должна ли она поднимать событие на по томков???

    _.set(this._storage, convertToCompositionPath(path), value);

    // Rise an event
    this._main.events.emit('mold.composition.update', {path: path});
  }

  /**
   * Update value. It use _.defaultsDeep method.
   * This method deeply mutates existent object or arrays.
   * @param path
   * @param value
     */
  update(path, value) {
    var compPath = convertToCompositionPath(path);
    if (_.isPlainObject(value)) {
      // It's a container

      var itemCallBack = (leafPath, newValue, oldValue, action) => {
        // TODO: здесь так же вызываются leafPath == '_id' || leafPath == '_rev'

        // TODO: сравнивать ли oldValue???
        if (_.isPlainObject(newValue)) {
          // Containers
          // Don't rise event if value unchanged
          // TODO: из-за этого не отрисовывается форма при переходах по страницам
          //if (_.isEqual(newValue, oldValue)) return;
        }
        else if (_.isArray(newValue)) {

        }
        else {
          // Primitive
          // Don't rise event if value unchanged
          // TODO: из-за этого не отрисовывается форма при переходах по страницам
          //if (newValue === oldValue) return;
        }

        // TODO: может добавить newValue, oldValue в событие
        this._main.events.emit('mold.composition.update', {
          path: _.trim(`${compPath}.${leafPath}`, '.'),
          action: action,
        });
      };

      if (!path) {
        // Update whore storage
        recursiveMutate(this._storage, value, itemCallBack, '');
      }
      else {
        // Update part of storage
        // TODO: лучше передавать path
        recursiveMutate(_.get(this._storage, compPath), value, itemCallBack, '');
      }
    }
    else if (_.isArray(value)) {
      // It's a collection or primitive array or empty array
      // TODO: в коллекциях формировать путь как положенно
      // TODO: в примитивных массивах нужно поднимать событие только на сам массив, не на потомков
      // TODO: если передан пустой массив и в старых данных это примитивный массив - то заменяем его и поднимаем событие
      // TODO: если передан пустой массив и в старых данных это коллекция - то очищаем коллекцию, и поднимаем событие update-delete на каждом элементе
      // TODO: поднимать событие только если элемен изменился
    }
    else {
      // It's a primitive or null|undefined
      // Don't update if value doesn't change
      if (_.get(this._storage, compPath) === value) return;

      _.set(this._storage, compPath, value);
      // Rise an event
      // TODO: может добавить newValue, oldValue в событие
      this._main.events.emit('mold.composition.update', {path: path, action: 'update'});
    }
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
      // TODO: заче это????
      $index: primaryId,
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
    this._main.events.emit('mold.composition.update', {path: path});
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
    this.set(pathToCollection, newCollection);

    // Rise an event
    this._main.events.emit('mold.composition.update', {path: path});
  }

  find(pathToCollection, params) {
    // TODO: !!!!
  }

  filter(pathToCollection, params) {
    // TODO: !!!!
  }

}
