// It's runtime state manager
import _ from 'lodash';

import { findTheClosestParentPath, eachSchema } from './helpers';
import Request from './Request';
import SaveBuffer from './SaveBuffer';


export default class State {
  init(main, storage) {
    this._main = main;
    this._storage = storage;
    this._saveBuffer = new SaveBuffer();
    this.$$request = new Request(this._main, storage, this._saveBuffer);
    this._handlers = {};
    this._sourceParams = {};

    var initialStorage = this._getInitialStorage(this._main.$$schemaManager.getFullSchema());
    this._storage.$init(initialStorage);
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

  onMoldUpdate(handler) {
    this._main.$$events.on('change', handler);
  }

  offMoldUpdate(handler) {
    this._main.$$events.off('change', handler);
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

  /**
   * Add to beginning of a collection in store by user action.
   * @param {string} pathToCollection
   * @param {object} newItem
   */
  unshift(pathToCollection, newItem) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToCollection);

    // TODO: перенести это в checkNode
    if (schema.type !== 'collection')
      throw new Error(`You can add new item only to collection!`);

    var preparedItem = {
      ...newItem,
      $isNew: true,
    };

    this._checkNode(pathToCollection, preparedItem);
    this._storage.unshift(pathToCollection, preparedItem);

    // TODO: наверное помечаются только добавленые элементы через document, либо имеющие документ выше
    // add to collection of unsaved added items
    this._saveBuffer.addUnsavedAddedItem(pathToCollection, preparedItem);
  }

  /**
   * Add to end of collection in store by user action.
   * @param {string} pathToCollection
   * @param {object} newItem
   */
  push(pathToCollection, newItem) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToCollection);

    // TODO: перенести это в checkNode
    if (schema.type !== 'collection')
      throw new Error(`You can add new item only to collection!`);

    var preparedItem = {
      ...newItem,
      $isNew: true,
    };

    this._checkNode(pathToCollection, preparedItem);
    this._storage.push(pathToCollection, preparedItem);

    // TODO: наверное помечаются только добавленые элементы через document, либо имеющие документ выше
    // add to collection of unsaved added items
    this._saveBuffer.addUnsavedAddedItem(pathToCollection, preparedItem);
  }

  /**
   * Remove from collection.
   * @param {string} pathToCollection
   * @param {object} itemToRemove
   */
  removeMold(pathToCollection, itemToRemove) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`You can remove only from collection!`);
    if (!_.isNumber(itemToRemove.$index))
      throw new Error(`Deleted item must has an $index param.`);

    var realItem = _.find(this._storage.get(pathToCollection), itemToRemove);
    // do nothing if item isn't exist
    if (!realItem) return;

    this._storage.remove(pathToCollection, realItem.$index);

    // TODO: наверное помечаются только добавленые элементы через document, либо имеющие документ выше
    // add to collection of unsaved removed items
    this._saveBuffer.addUnsavedRemovedItem(pathToCollection, realItem);
  }

  /**
   * Set page to paged collection in store.
   * It doesn't mark items as unsaved.
   * @param {string} pathToPagedCollection
   * @param {Array} page
   * @param {number} pageNum. It's required.
   */
  setPage(pathToPagedCollection, page, pageNum) {
    // It rises an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(pathToPagedCollection);

    // TODO: перенести это в checkNode
    if (schema.type !== 'pagedCollection' && schema.type !== 'documentsCollection')
      throw new Error(`You can add new item only to paged collection!`);

    var preparedPage = _.map(page, (item) => {
      return {
        ...item,
        $isNew: true,
      };
    });

    //this._checkNode(pathToPagedCollection, page);
    this._storage.addTo(pathToPagedCollection, preparedPage, pageNum);
  }

  destroy(moldPath) {
    if (this._handlers[moldPath]) {
      _.each(this._handlers[moldPath], (handler) => {
        // TODO: странное название события
        this._main.$$events.removeListener('mold.update::' + moldPath, handler);
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


    schema = schema || this._main.$$schemaManager.get(path);



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

  _getInitialStorage(rawSchema) {
    var initialStorage = {};

    // Init storage. Collection's init behavior if different than in schema init.
    eachSchema(rawSchema, (path, value) => {
      //  convert from schema to lodash
      var moldPath = path.replace(/\.schema/g, '');
      if (value.type == 'document') {
        _.set(initialStorage, moldPath, {});

        // Go through inner param 'schema'
        //return 'schema';
      }
      else if (value.type == 'container') {
        _.set(initialStorage, moldPath, {});

        // Go through inner param 'schema'
        //return 'schema';
      }
      else if (value.type == 'documentsCollection') {
        _.set(initialStorage, moldPath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'pagedCollection') {
        _.set(initialStorage, moldPath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'collection') {
        _.set(initialStorage, moldPath, []);

        // don't go deeper
        return false;
      }
      else if (value.type == 'array') {
        _.set(initialStorage, moldPath, []);

        // don't go deeper
        return false;
      }
      else if (_.includes(['boolean', 'string', 'number'], value.type)) {
        _.set(initialStorage, moldPath, null);

        // don't go deeper
        return false;
      }
    });

    return initialStorage;
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
}
