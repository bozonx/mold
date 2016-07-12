// It's runtime state manager
import _ from 'lodash';

import Request from './Request';

import { recursiveSchema, findPrimary, splitLastParamPath } from './helpers';

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
  getValue(pathToContainer) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToContainer);

    // if (!this._main.schemaManager.has(path))
    //   throw new Error(`Can't find path "${path}" in the schema!`);

    if (_.includes(['boolean', 'string', 'number', 'array'], schema.type))
      throw new Error(`You can't request for a primitive! Only containers are support.`);

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
        method: 'get',
        fullPath: pathToContainer,
      }).then((resp) => {
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        this._composition.update(pathTo, resp.coocked);
        resolve(resp);
      }, reject);
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
   * You can set only to container
   * @param {string} pathToContainer - absolute path to container
   * @param {*} containerValue
   * @returns {Promise}
   */
  setSilent(pathToContainer, containerValue) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToContainer);

    if (_.includes(['boolean', 'string', 'number', 'array'], schema.type))
      throw new Error(`You can't do request for a primitive! Only containers are support.`);

    // Check all nodes
    this._checkNode(schema, pathToContainer, containerValue);

    return new Promise((resolve, reject) => {
      this._startDriverQuery({
        method: 'set',
        fullPath: pathToContainer,
        payload: containerValue,
      }).then((resp) => {
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        this._composition.update(pathTo, resp.coocked);
        resolve(resp);
      }, reject);
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

  setMold(pathToContainer, containerValue) {
    // TODO: тут не обязательно устанавливать в контейнер, можно прямо в primitive

    // It rise an error if path doesn't consist with schema
    // TODO: наверное конвертировать путь в schemaPath
    var schema = this._main.schemaManager.get(pathToContainer);

    if (_.includes(['boolean', 'string', 'number', 'array'], schema.type))
      throw new Error(`You can't do request for a primitive! Only containers are support.`);

    // Check all nodes
    this._checkNode(schema, pathToContainer, containerValue);

    this._composition.update(pathToContainer, containerValue);
  }

  addMold(pathToCollection, newItem) {
    // It rise an error if path doesn't consist with schema
    // TODO: наверное конвертировать путь в schemaPath
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type has "add" method.`);

    var preparedItem = {
      ...newItem,
      __isNew: true,
    };

    // Check all nodes
    this._checkNode(schema, pathToCollection, preparedItem);

    this._composition.add(pathToCollection, preparedItem);

    //this._composition.update(pathToCollection, preparedItem);

    //var primaryKeyName = findPrimary(schema.item);
  }

  save(pathToContainerOrPrimitive) {
    // TODO: rise an event - saved

    var pathToContainer;

    if (this._main.schemaManager.get(pathToContainerOrPrimitive).type) {
      // If it isn't container, get container upper on path
      let split = splitLastParamPath(pathToContainerOrPrimitive);

      if (_.isUndefined(split.paramPath))
      // TODO: это должно проверяться ещё на стадии валидации схемы.
        throw new Error(`Something wrong with your schema. Root of primitive must be a container.`);

      pathToContainer = split.basePath;
      if (this._main.schemaManager.get(pathToContainer).type) {
        // TODO: это должно проверяться ещё на стадии валидации схемы.
        throw new Error(`Something wrong with your schema. Primitive must be placed in container.`);
      }
    }
    else {
      pathToContainer = pathToContainerOrPrimitive;
    }

    var payload = this.getComposition(pathToContainer);

    return new Promise((resolve, reject) => {
      this._startDriverQuery({
        method: 'set',
        fullPath: pathToContainer,
        payload: payload,
      }).then((resp) => {
        var pathTo = resp.request.pathToDocument || resp.request.fullPath;
        // update composition with server response
        this._composition.update(pathTo, resp.coocked);
        resolve(resp);
      }, reject);
    });
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
      method: 'add',
      fullPath: pathToCollection,
      payload: newItem,
      primaryKeyName,
    }).then((resp) => {
      // TODO: может за это должен отвечать сам пользователь?
      this._composition.add(pathToCollection, resp.coocked[primaryKeyName], resp.coocked);
    });
  }

  removeSilent(pathToCollection, item) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(pathToCollection);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type can remove item`);

    var primaryKeyName = findPrimary(schema.item);

    return this._startDriverQuery({
      method: 'remove',
      fullPath: pathToCollection,
      payload: item,
      primaryKeyName,
    }).then((resp) => {
      this._composition.remove(pathToCollection, resp.coocked[primaryKeyName]);
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
   * @param {{method: string, fullPath: string, payload: *}} params
   *     * method is one of: get, set, add, remove
   *     * fullPath: full path in mold
   *     * payload: for "set" and "add" methods - value to set
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
