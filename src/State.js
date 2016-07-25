// It's runtime state manager
import _ from 'lodash';

import { recursiveSchema, splitLastParamPath } from './helpers';
import Request from './Request';

export default class State {
  init(main, composition) {
    this._main = main;
    this._composition = composition;
    this._request = new Request(this._main, composition);
    this._addedUnsavedItems = {};
    this._removedUnsavedItems = {};

    this._initComposition();
  }

  /**
   * Get mold by path
   * @param {string} path
   */
  getMold(path) {
    return this._composition.get(path);
  }

  /**
   * Set primitive, container or collection to mold
   * @param {string} fullPath
   * @param {*} value - valid value
   */
  setMold(fullPath, value) {
    this._checkNode(fullPath, value);
    this._composition.update(fullPath, value);
  }

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
    this._addToUnsavedList(this._addedUnsavedItems, pathToCollection, preparedItem);
  }

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
    this._addToUnsavedList(this._removedUnsavedItems, pathToCollection, realItem);
  }

  /**
   * Get data from driver, update mold with new data and return primise
   * @param fullPath
   * @returns {Promise}
   */
  load(fullPath) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(fullPath);

    if (schema.type == 'collection') {
      // get collection
      return this._request.loadCollection(fullPath, (pathTo, resp) => {
        this._composition.update(pathTo, resp.coocked);
      });
    }
    else if (_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
      return this._request.loadPrimitive(fullPath, (pathTo, resp) => {
        this._composition.update(pathTo, resp.coocked);
      });
    }
    else if (!schema.type) {
      return this._request.loadContainer(fullPath, (pathTo, resp) => {
        this._composition.update(pathTo, resp.coocked);
      });
    }

    throw new Error(`Unknown type!`);
  }

  save(fullPath) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(fullPath);

    if (schema.type == 'collection') {
      // get collection
      // TODO: плохо передавать списки несохраненных
      return this._request.saveCollection(fullPath, this._addedUnsavedItems, this._removedUnsavedItems);
    }
    else if (_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
      return this._request.savePrimitive(fullPath);
    }
    else if (!schema.type) {
      return this._request.saveContainer(fullPath);
    }

    throw new Error(`Unknown type!`);
  }


  _addToUnsavedList(listWithUnsavedItems, pathToCollection, item) {
    if (!listWithUnsavedItems[pathToCollection])
      listWithUnsavedItems[pathToCollection] = [];

    listWithUnsavedItems[pathToCollection].push(item);
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
