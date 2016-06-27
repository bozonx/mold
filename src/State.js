// It's runtime state manager
import _ from 'lodash';

import Request from './Request';

import { recursiveSchema, findPrimary } from './helpers';

export default class State {
  init(main, composition) {
    this._main = main;
    this._composition = composition;
    this._request = new Request(this._main);
    this._initComposition();
  }

  /**
   * Get value directly
   * @param path
   */
  getComposition(path) {
    // Does it really need?
    return this._composition.get(path);
  }

  /**
   * Set directly
   * @param path
   * @param value
   */
  setComposition(path, value) {
    // Does it really need?
    this._composition.set(path, value);
  }

  /**
   * Get data by a path.
   * It sends request to applicable driver.
   * After it sets a value from response to composition and return promise with this value.
   * @param {string} path - absolute path
   * @returns {Promise}
   */
  getValue(path) {
    if (!this._main.schemaManager.has(path))
      throw new Error(`Can't find path "${path}" in the schema!`);

    // return this._startDriverQuery({
    //   type: 'get',
    //   fullPath: path,
    // }).then((resp) => {
    //   if (resp.request.pathToDocument) {
    //     this._composition.update(resp.request.pathToDocument, resp.successResponse);
    //   }
    //   else {
    //     this._composition.update(resp.request.fullPath, resp.successResponse)
    //   }
    // });

    return new Promise((resolve, reject) => {
      this._startDriverQuery({
        type: 'get',
        fullPath: path,
      }).then((resp) => {
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        this._composition.update(pathTo, resp.successResponse);
        resolve(resp);
      }, (err) => {
        reject(err);
      });
    });
  }

  addItem(path, newItem) {
    // TODO: rise an event
    return this.addSilent(path, newItem);
  }

  removeItem(path, item) {
    // TODO: rise an event
    return this.removeSilent(path, item);
  }

  /**
   * Set new value to state and rise an event.
   * It sends request to driver and returns its promise.
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {Promise}
   */
  setValue(path, value) {
    // TODO: rise an event
    return this.setSilent(path, value);
  }

  /**
   * Check and set a new value to state without rising an event.
   * You can set all values to branch if you pass a container.
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {Promise}
   */
  setSilent(path, value) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(path);

    // Check all nodes
    this._checkNode(schema, path, value);

    return new Promise((resolve, reject) => {
      this._startDriverQuery({
        type: 'set',
        fullPath: path,
        payload: value,
      }).then((resp) => {
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        this._composition.update(pathTo, resp.successResponse);
        resolve(resp);
      }, (err) => {
        reject(err);
      });
    });

    // return this._startDriverQuery({
    //   type: 'set',
    //   fullPath: path,
    //   payload: value,
    // }).then((resp) => {
    //   console.log(234234234234, resp)
    //   if (resp.request.pathToDocument) {
    //     this._composition.update(resp.request.pathToDocument, resp.successResponse);
    //   }
    //   else {
    //     this._composition.update(resp.request.fullPath, resp.successResponse)
    //   }
    //   return resp;
    // });
  }

  /**
   *
   * @param {string} pathToCollection - absolute path to collection
   * @param {object} newItem
   * @returns {Promise}
   */
  addSilent(pathToCollection, newItem) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type can add item`);

    var primaryKeyName = findPrimary(schema.item);

    // It rises an error on invalid value
    // TODO: проверка делается в _startDriverQuery
    this._checkNode(schema, pathToCollection, newItem);

    return this._startDriverQuery({
      type: 'add',
      fullPath: pathToCollection,
      payload: newItem,
      primaryKeyName,
    }).then((resp) => {
      // TODO: может за это должен отвечать сам пользователь?
      this._composition.add(pathToCollection, resp.payload[primaryKeyName], resp.payload);
    });
  }

  removeSilent(pathToCollection, item) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type can remove item`);

    var primaryKeyName = findPrimary(schema.item);

    return this._startDriverQuery({
      type: 'remove',
      fullPath: pathToCollection,
      payload: item,
      primaryKeyName,
    }).then((resp) => {
      this._composition.remove(pathToCollection, resp.payload[primaryKeyName]);
    });
  }

  /**
   * Validate value using validate settings by path
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {boolean}
   */
  _validateValue(path, value) {
    // TODO: сделать
    return true;
  }

  /**
   * Check for node. It isn't work with container.
   * It rises an error on invalid value or node.
   * @param {object} schema - schema for path
   * @param {string} path - path to a param. (Not to container)
   * @param {*} value - value to set. (Not undefined and not an object)
   * @returns {boolean}
   * @private
   */
  _checkNode(schema, path, value) {
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
        this._checkNode(childSchema, childPath, childValue);

        return false;
      }

      // If it's a container - go deeper
      return true;
    }

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
      if (this._validateValue(path, value)) {
        return true;
      }
    }
    else if (!schema.type) {
      // It's a container - check values for all children
      //recursiveSchema(path, schema, _checkRecursively.bind(this, path, value));
      return true;
    }


    throw new Error(`Not valid value "${JSON.stringify(value)}" of param "${path}"! See validation rules in your schema.`);
  }

  /**
   * Send query to driver for data.
   * @param {{type: string, fullPath: string, payload: *}} params
   *     * type is one of: get, set, add, delete
   *     * path: full path in mold
   *     * requestValue: for "set" and "add" types - value to set
   * @returns {Promise}
   * @private
   */
  _startDriverQuery(params) {
    var driver = this._main.schemaManager.getDriver(params.fullPath);

    if (!driver)
      throw new Error(`No-one driver did found!!!`);

    var req = this._request.generate(params);
    return driver.requestHandler(req);
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
      else if (value.type == 'boolean' || value.type == 'string' || value.type == 'number') {
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
