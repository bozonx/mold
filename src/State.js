// It's runtime state manager
import _ from 'lodash';

import Request from './Request';
import events from './events';
import { recursiveSchema, findPrimary } from './helpers';

export default class State {
  init(_main, composition) {
    this._main = _main;
    this._composition = composition;
    this._request = new Request(this._main);
  }

  /**
   * Get value directly
   * @param path
   */
  getComposition(path) {
    return this._composition.get(path);
  }

  /**
   * Set directly
   * @param path
   * @param value
   */
  setComposition(path, value) {
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

    // TODO: set to composition

    return this._startDriverQuery({
      type: 'get',
      fullPath: path,
    });
  }

  find(path, params) {
    if (!this._main.schemaManager.has(path))
      throw new Error(`Can't find path "${path}" in the schema!`);

    // TODO: set to composition

    return this._startDriverQuery({
      type: 'find',
      fullPath: path,
      payload: params,
    });
  }


  filter(path, params) {
    if (!this._main.schemaManager.has(path))
      throw new Error(`Can't find path "${path}" in the schema!`);

    // TODO: set to composition

    return this._startDriverQuery({
      type: 'filter',
      fullPath: path,
      payload: params,
    });
  }


  addItem(path, newItem) {
    return this.addSilent(path, newItem);
  }

  removeItem(path, item) {
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
    // TODO: по умолчанию mold обновляется и потом делается запрос,
    // TODO:     * но если запрос не удастся - наверное надо вернуть как было??? или дать приложению решить
    // TODO:     * в конфиге можно задать, чтобы mold обновлялся только после успешного запроса на сервер

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
      this.setComposition(path, value);
      // Rise an event
      events.emit('mold.composition.update', {path: path});
    }
    else {
      // It's a container - set values for all children
      recursiveSchema(path, schema, this._setRecursively.bind(this, path, value));
    }

    return this._startDriverQuery({
      type: 'set',
      fullPath: path,
      payload: value,
    });
  }

  /**
   *
   * @param {string} path - absolute path
   * @param {object} newItem
   * @returns {Promise}
   */
  addSilent(path, newItem) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(path);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type can add item`);

    // It rises an error on invalid value
    this._checkNode(schema, path, newItem);
    // TODO: тут устанавливается значение сразу, до запроса в базу - но в конфиге можно указать чтобы после
    let composition = this.getComposition(path);
    composition.push(newItem);

    return this._startDriverQuery({
      type: 'add',
      fullPath: path,
      payload: newItem,
    });
  }

  removeSilent(path, item) {
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(path);

    if (schema.type !== 'collection')
      throw new Error(`Only collection type can remove item`);

    var primaryKeyName = findPrimary(schema.item);
    var primaryId = item[primaryKeyName];
    if (_.isUndefined(primaryId))
      throw new Error(`The item ${JSON.stringify(item)} doesn't have a primary id. See your schema.`);

    _.remove(this.getComposition(path), {[primaryKeyName]: primaryId});

    return this._startDriverQuery({
      type: 'remove',
      fullPath: path,
      payload: item,
    });
  }

  // /**
  //  * Reset param or children params to defaults
  //  * @param {string} path - absolute path
  //  */
  // resetToDefault(path) {
  //   // TODO: переделать на this.setValue
  //   // TODO: наверное тоже надо вернуть {Promise}
  //   // TODO: использовать setSilent
  //
  //   var setToItem = (itemPath, itemSchema) => {
  //     if (!_.isUndefined(itemSchema.default)) {
  //       // set a value
  //       this.setComposition(itemPath, itemSchema.default);
  //     }
  //     else {
  //       // set null
  //       this.setComposition(itemPath, null);
  //     }
  //   };
  //
  //   var itemSchema = this._main.schemaManager.get(path);
  //   if (itemSchema.type) {
  //     // for item
  //     setToItem(path, itemSchema);
  //   }
  //   else {
  //     // for container, set on each child
  //     // TODO: recursively
  //     _.each(itemSchema, (value, name) => {
  //       if (value.type) setToItem(`${path}.${name}`, value);
  //     });
  //   }
  // }

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
      // Rise an event
      events.emit('mold.composition.update', {path: childPath});

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
   * @param {{type: string, fullPath: string, value: *}} params
   *     * type is one of: get, set, add, delete
   *     * path: full path in mold
   *     * requestValue: for "set" and "add" types - value to set
   * @returns {Promise}
   * @private
   */
  _startDriverQuery(params) {
    var driver = this._main.schemaManager.getDriver(params.fullPath);

    // if driver not defined - it means memory driver
    if (!driver)
      return new Promise((resolve) => {
        if (params.type == 'find') {
          let list = this.getComposition(params.fullPath);
          resolve( _.find(list, params.payload) );
        }
        else if (params.type == 'filter') {
          let list = this.getComposition(params.fullPath);
          resolve( _.filter(list, params.payload) );
        }
        else {
          resolve( this.getComposition(params.fullPath) );
        }
      });

    return new Promise((resolve, reject) => {
      var req = this._request.generate(params.type, params.fullPath, params.payload);

      var resolveHandler = (responce) => {
        // TODO: установить данные в composition, учитывая модель и ответ драйвера
        resolve(responce);
      };

      return driver.requestHandler(req, resolveHandler, reject);
    });
  }

}
