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

    var promise = this._startDriverQuery({
      type: 'get',
      fullPath: path,
    });

    promise.then((resp) => {
      if (resp.request.pathToDocument) {
        this._composition.update(resp.request.pathToDocument, resp.successResponse);
      }
      else {
        this._composition.update(resp.request.fullPath, resp.successResponse)
      }
    });

    return promise;
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
    // TODO: test - установка всех значений для контейнера

    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(path);

    // TODO: only for primitives
    
    

    if (schema.type) {
      // If it's a param or list - just set a value
      // It rises an error on invalid value
      this._checkNode(schema, path, value);
      // TODO: тут устанавливается значение сразу, до запроса в базу - но в конфиге можно указать чтобы после
      // Set to composition
      //this.setComposition(path, value);

    }
    else {
      // TODO: валидация всех параметров
      // It's a container - set values for all children
      //recursiveSchema(path, schema, this._setRecursively.bind(this, path, value));
    }

    var promise = this._startDriverQuery({
      type: 'set',
      fullPath: path,
      payload: value,
    });

    promise.then((resp) => {
      if (resp.request.pathToDocument) {
        this._composition.update(resp.request.pathToDocument, resp.successResponse);
      }
      else {
        this._composition.update(resp.request.fullPath, resp.successResponse)
      }
    });

    return promise;
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

    var promise = this._startDriverQuery({
      type: 'add',
      fullPath: pathToCollection,
      payload: newItem,
      primaryKeyName,
    });


    promise.then((resp) => {
      // TODO: может за это должен отвечать сам пользователь?
      this._composition.add(pathToCollection, resp.payload[primaryKeyName], resp.payload);
    });

    return promise;
  }

  removeSilent(pathToCollection, item) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type can remove item`);

    var primaryKeyName = findPrimary(schema.item);

    var promise = this._startDriverQuery({
      type: 'remove',
      fullPath: pathToCollection,
      payload: item,
      primaryKeyName,
    });

    promise.then((resp) => {
      this._composition.remove(pathToCollection, resp.payload[primaryKeyName]);
    });

    return promise;
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

  _setRecursively(path, value, childPath, childSchema) {
    if (childSchema.type) {
      // param
      var valuePath = childPath;
      if (path !== '') valuePath = childPath.replace(path + '.', '');

      var childValue = _.get(value, valuePath);

      // If value doesn't exist for this schema branch - do nothing
      if (_.isUndefined(childValue)) return false;

      // It rises an error on invalid value
      this._checkNode(childSchema, childPath, childValue);

      // Set to composition
      this.setComposition(childPath, childValue);

      return false;
    }

    // If it's a container - go deeper
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
    if (schema.type == 'array') {
      // For array
      // TODO: validate all items in list
      return true;
    }
    if (schema.type == 'collection') {
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

    throw new Error(`Not valid value "${value}" of param "${path}"! See validation rules in your schema.`);
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
