// It's runtime state manager
import _ from 'lodash';

import { recursiveSchema, findTheClosestParentPath } from './helpers';
import Request from './Request';

export default class State {
  init(main, storage) {
    this._main = main;
    this._storage = storage;
    this._request = new Request(this._main, storage);
    this._handlers = {};
    this._sourceParams = {};

    this._initStorage();
  }

  /**
   * Get parameters for source path template.
   * @param {string} moldPath
   * @returns {object}
   */
  getSourceParams(moldPath) {
    if (this._sourceParams[moldPath]) return this._sourceParams[moldPath];

    // For primitives - find the closest parent
    var findtheClosestParentPath = findTheClosestParentPath(moldPath, this._sourceParams);

    return this._sourceParams[findtheClosestParentPath];
  }

  /**
   * Set parameters for source path template.
   * @param {string} moldPath
   * @param {object} params
   */
  setSourceParams(moldPath, params) {
    this._sourceParams[moldPath] = params;
  }

  /**
   * Get mold by path
   * @param {string} moldPath
   * @returns {*} - value from mold
   */
  getMold(moldPath) {
    return this._storage.get(moldPath);
  }

  /**
   * Set primitive, container or collection to mold
   * @param {string} moldPath
   * @param {*} value - valid value
   */
  setMold(moldPath, value) {
    this._checkNode(moldPath, value);
    this._storage.update(moldPath, value);
  }

  onMoldUpdate(handler) {
    this._main.events.on('mold.update', handler);
  }

  offMoldUpdate(handler) {
    this._main.events.off('mold.update', handler);
  }

  /**
   * Add to collection in mold.
   * @param {string} pathToCollection
   * @param {object} newItem
   */
  addMold(pathToCollection, newItem) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);
    if (schema.type !== 'collection')
      throw new Error(`Only collection type has "add" method.`);

    var preparedItem = {
      ...newItem,
      $isNew: true,
    };

    this._checkNode(pathToCollection, preparedItem);
    this._storage.addToBeginning(pathToCollection, preparedItem);
    // add to collection of unsaved added items
    this._request.addUnsavedAddedItem(pathToCollection, preparedItem);
  }

  /**
   * Remove from collection.
   * @param {string} pathToCollection
   * @param {object} itemToRemove
   */
  removeMold(pathToCollection, itemToRemove) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type has "add" method.`);
    if (!_.isNumber(itemToRemove.$index))
      throw new Error(`Deleted item must has an $index param.`);

    var realItem = _.find(this._storage.get(pathToCollection), itemToRemove);
    // do nothing if item isn't exist
    if (!realItem) return;

    this._storage.remove(pathToCollection, realItem.$index);
    // add to collection of unsaved removed items
    this._request.addUnsavedRemovedItem(pathToCollection, realItem);
  }

  /**
   * Get data from driver, update mold with new data and return primise
   * @param {string} moldPath - full path in mold
   * @param {object} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  load(moldPath, sourceParams) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(moldPath);

    if (schema.type == 'container') {
      return this._request.loadContainer(moldPath, sourceParams);
    }
    else if (schema.type == 'document') {
      return this._request.loadContainer(moldPath, sourceParams);
    }
    else if (schema.type == 'documentsCollection') {
      return this._request.loadCollection(moldPath, sourceParams);
    }
    else if (schema.type == 'collection') {
      return this._request.loadCollection(moldPath, sourceParams);
    }
    else if (_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
      return this._request.loadPrimitive(moldPath, sourceParams);
    }

    throw new Error(`Unknown type!`);
  }

  /**
   * Save unsaved data to driver by path.
   * @param {string} moldPath - full path in mold
   * @param {object} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  save(moldPath, sourceParams) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(moldPath);

     if (schema.type == 'container') {
      return this._request.saveContainer(moldPath, sourceParams);
    }
    if (schema.type == 'document') {
      return this._request.saveContainer(moldPath, sourceParams);
    }
    if (schema.type == 'documentsCollection') {
      return this._request.saveCollection(moldPath, sourceParams);
    }
    else if (schema.type == 'collection') {
      return this._request.saveCollection(moldPath, sourceParams);
    }
    else if (_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
      return this._request.savePrimitive(moldPath, sourceParams);
    }

    throw new Error(`Unknown type!`);
  }

  // /**
  //  * Add change event handler on path.
  //  * @param {string} moldPath - full path in mold
  //  * @param {function} handler
  //  */
  // addListener(moldPath, handler) {
  //   // Save listener
  //   if (!this._handlers[moldPath]) this._handlers[moldPath] = [];
  //   this._handlers[moldPath].push(handler);
  //
  //   // Add listener
  //   this._main.events.on('mold.update::' + moldPath, handler);
  // }
  //
  // /**
  //  * Remove change event handler from path.
  //  * @param {string} moldPath - full path in mold
  //  * @param {function} handler
  //  */
  // removeListener(moldPath, handler) {
  //   // Remove listener
  //   if (!this._handlers[moldPath]) return;
  //   var index = _.indexOf(this._handlers[moldPath], handler);
  //   if (index < 0) return;
  //   this._handlers[moldPath].splice(index, 1);
  //
  //   // Unbind listener
  //   this._main.events.removeListener('mold.update::' + moldPath, handler);
  // }

  destroy(moldPath) {
    if (this._handlers[moldPath]) {
      _.each(this._handlers[moldPath], (handler) => {
        this._main.events.removeListener('mold.update::' + moldPath, handler);
      });
      this._handlers[moldPath] = [];
    }

    this._storage.clear(moldPath);
  }

  /**
   * Check for node. It isn't work with container.
   * It rises an error on invalid value or node.
   * @param {string} path - path to a param. (Not to container)
   * @param {*} value - value to set. (Not undefined and not an object)
   * @returns {boolean}
   * @private
   */
  _checkNode(path, value, schema) {
    // TODO: переделать!!!

    return true;


    schema = schema || this._main.schemaManager.get(path);



    var _checkRecursively = function(path, value, childPath, childSchema) {
      if (childSchema.type) {
        // param
        var valuePath = childPath;
        if (path !== '') valuePath = childPath.replace(path + '.', '');

        var childValue = _.get(value, valuePath);

        // If value doesn't exist for this schema branch - do nothing
        if (_.isUndefined(childValue)) return false;

        // It rises an error on invalid value
        this._checkNode(childPath, childValue, childSchema);

        return false;
      }

      // If it's a container - go deeper
      return true;
    };

    if (schema.type == 'array') {
      // For array
      // TODO: validate all items in list
      return true;
    }
    else if (schema.type == 'collection') {
      // For collection
      // TODO: do it for parametrized lists
      // TODO: validate all items in list
      return true;
    }
    else if (schema.type) {
      // For primitive
      // TODO: validate it!!!
      return true;
    }
    else if (!schema.type) {
      // It's a container - check values for all children
      //recursiveSchema(path, schema, _checkRecursively.bind(this, path, value));
      return true;
    }


    throw new Error(`Not valid value "${JSON.stringify(value)}" of param "${path}"! See validation rules in your schema.`);
  }

  /**
   * Set initial values (null|[]|{}) to storage for all items from schema.
   * @private
   */
  _initStorage() {
    var storageValues = {};

    // TODO: объединить это с инициализацией схемы

    recursiveSchema('', this._main.schemaManager.get(''), (newPath, value) => {
      if (value.type == 'container') {
        _.set(storageValues, newPath, {});

        // Go deeper
        return 'schema';
      }
      if (value.type == 'document') {
        _.set(storageValues, newPath, {});

        // Go deeper
        return 'schema';
      }
      else if (value.type == 'documentsCollection') {
        _.set(storageValues, newPath, []);

        // Dont't go deeper
        return false;
      }
      else if (value.type == 'collection') {
        _.set(storageValues, newPath, []);

        // Dont't go deeper
        return false;
      }
      else if (value.type == 'array') {
        // array
        _.set(storageValues, newPath, []);

        // Dont't go deeper
        return false;
      }
      else if (_.includes(['boolean', 'string', 'number'], value.type)) {
        // primitive
        _.set(storageValues, newPath, null);

        // Dont't go deeper
        return false;
      }
    });

    this._storage.$init(storageValues);
  }
}
