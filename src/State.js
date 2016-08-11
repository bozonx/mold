// It's runtime state manager
import _ from 'lodash';

import { recursiveSchema } from './helpers';
import Request from './Request';

export default class State {
  init(main, composition) {
    this._main = main;
    this._composition = composition;
    this._request = new Request(this._main, composition);
    this._handlers = {};

    this._initComposition();
  }

  /**
   * Get mold by path
   * @param {string} path
   * @returns {*} - value from mold
   */
  getMold(path) {
    return this._composition.get(path);
  }

  /**
   * Set primitive, container or collection to mold
   * @param {string} moldPath
   * @param {*} value - valid value
   */
  setMold(moldPath, value) {
    this._checkNode(moldPath, value);
    this._composition.update(moldPath, value);
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
    this._composition.addToBeginning(pathToCollection, preparedItem);
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

    var realItem = _.find(this._composition.get(pathToCollection), itemToRemove);
    // do nothing if item isn't exist
    if (!realItem) return;

    this._composition.remove(pathToCollection, realItem.$index);
    // add to collection of unsaved removed items
    this._request.addUnsavedRemovedItem(pathToCollection, realItem);
  }

  /**
   * Get data from driver, update mold with new data and return primise
   * @param {string} moldPath - full path in mold
   * @returns {Promise}
   */
  load(moldPath) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(moldPath);

    if (schema.type == 'collection') {
      return this._request.loadCollection(moldPath);
    }
    else if (_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
      return this._request.loadPrimitive(moldPath);
    }
    else if (!schema.type) {
      // It's container
      return this._request.loadContainer(moldPath);
    }

    throw new Error(`Unknown type!`);
  }

  /**
   * Save unsaved data to driver by path.
   * @param {string} moldPath - full path in mold
   * @returns {Promise}
   */
  save(moldPath) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(moldPath);

    if (schema.type == 'collection') {
      return this._request.saveCollection(moldPath);
    }
    else if (_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
      return this._request.savePrimitive(moldPath);
    }
    else if (!schema.type) {
      return this._request.saveContainer(moldPath);
    }

    throw new Error(`Unknown type!`);
  }

  /**
   * Add change event handler on path.
   * @param {string} moldPath - full path in mold
   * @param {function} handler
   */
  addListener(moldPath, handler) {
    // Save listener
    if (!this._handlers[moldPath]) this._handlers[moldPath] = [];
    this._handlers[moldPath].push(handler);

    // Add listener
    this._main.events.on('mold.update::' + moldPath, handler);
  }

  /**
   * Remove change event handler from path.
   * @param {string} moldPath - full path in mold
   * @param {function} handler
   */
  removeListener(moldPath, handler) {
    // Remove listener
    if (!this._handlers[moldPath]) return;
    var index = _.indexOf(this._handlers[moldPath], handler);
    if (index < 0) return;
    this._handlers[moldPath].splice(index, 1);

    // Unbind listener
    this._main.events.removeListener('mold.update::' + moldPath, handler);
  }

  destroy(moldPath) {
    // TODO: test it
    if (this._handlers[moldPath]) {
      _.each(this._handlers[moldPath], (handler) => {
        this._main.events.removeListener('mold.update::' + moldPath, handler);
      });
      this._handlers[moldPath] = [];
    }

    // TODO: clear mold
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
    schema = schema || this._main.schemaManager.get(path);

    // TODO: переделать!!!

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
   * Set initial values (null|[]) to composition for all items from schema.
   * @private
   */
  _initComposition() {
    var compositionValues = {};

    recursiveSchema('', this._main.schemaManager.get(''), (newPath, value) => {
      if (value.type == 'array') {
        // array
        _.set(compositionValues, newPath, []);

        // Go deeper
        return false;
      }
      else if (value.type == 'collection') {
        _.set(compositionValues, newPath, []);

        // Go deeper
        return false;
      }
      else if (_.includes(['boolean', 'string', 'number'], value.type)) {
        // primitive
        _.set(compositionValues, newPath, null);

        return false;
      }
      else {
        // container
        _.set(compositionValues, newPath, {});

        // Go deeper
        return true;
      }
    });

    this._composition.$initAll(compositionValues);
  }
}
