// It's runtime state manager
import _ from 'lodash';

import { recursiveSchema } from './helpers';

export default class State {
  init(_main, composition) {
    this._main = _main;
    this._composition = composition;
  }

  /**
   * Get value without any checks
   * @param path
   */
  getComposition(path) {
    return this._composition.get(path);
  }

  // /**
  //  * Get data by path
  //  * example:
  //  *     getValue('settings.showNotifications')
  //  *     // it returns promise with current value
  //  * @param {string} path - absolute path
  //  * @returns {Promise}
  //  */
  // getValue(path) {
  //   // TODO: always returns a promise!!!
  //
  //   if (this._composition.has(path)) {
  //     // if composition has a value - return it
  //     return this._composition.get(path);
  //   }
  //   else if (this._main.schemaManager.has(path)) {
  //     // TODO: переделать - нужно делать запрос в драйвер
  //     // Init a value.
  //     // In common use it doesn't happens because composition param initializing on creating new item/list instance
  //     this._composition.set(path, null);
  //     return null;
  //   }
  //
  //   // It's a bad request for non existent param
  //   throw new Error(`Can't get a value, a param ${path} doesn't exists in schema!`);
  // }

  /**
   * Set value without any checks
   * @param path
   * @param value
   */
  setComposition(path, value) {
    this._composition.set(path, value);
  }

  /**
   * Set new value to state
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {Promise}
   */
  setValue(path, value) {
    // TODO: rise an event
    // TODO: сделать запрос в драйвер

    return this.setSilent(path, value);
  }

  /**
   * Set new value silently to state.
   * You can set all values to branch if you pass a container.
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {Promise}
   */
  setSilent(path, value) {
    // TODO: по умолчанию mold обновляется и потом делается запрос,
    // TODO:     * но если запрос не удастся - наверное надо вернуть как было??? или дать приложению решить
    // TODO:     * в конфиге можно задать, чтобы mold обновлялся только после успешного запроса на сервер

    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(path);

    // TODO: валидацию сдедать отдельной функцией

    try {
      if (schema.type) {
        // If it's a param or list - just set a value
        this._checkAndSetValue(schema, path, value);
      }
      else {
        // It's a container - set values for all children
        recursiveSchema(path, schema, this._setRecursively.bind(this, path, value));
      }
    } catch (err) {
      throw new Error(err);
    }

    return this._startDriverQuery({
      type: 'set',
      path: path,
      requestValue: value,
    });
  }

  /**
   * Reset param or children params to defaults
   * @param {string} path - absolute path
   */
  resetToDefault(path) {
    // TODO: переделать на this.setValue
    // TODO: наверное тоже надо вернуть {Promise}
    // TODO: использовать setSilent

    var setToItem = (itemPath, itemSchema) => {
      if (!_.isUndefined(itemSchema.default)) {
        // set a value
        this.setComposition(itemPath, itemSchema.default);
      }
      else {
        // set null
        this.setComposition(itemPath, null);
      }
    };

    var itemSchema = this._main.schemaManager.get(path);
    if (itemSchema.type) {
      // for item
      setToItem(path, itemSchema);
    }
    else {
      // for container, set on each child
      // TODO: recursively
      _.each(itemSchema, (value, name) => {
        if (value.type) setToItem(`${path}.${name}`, value);
      });
    }
  }

  /**
   * Validate value using validate settings by path
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {boolean}
   */
  validateValue(path, value) {
    // TODO: сделать
    return true;
  }

  _setRecursively(path, value, childPath, childSchema, childName) {
    if (childSchema.type) {
      // param
      var valuePath = childPath;
      if (path !== '') valuePath = childPath.replace(path + '.', '');

      var childValue = _.get(value, valuePath);

      // If value doesn't exist for this schema branch - do nothing
      if (_.isUndefined(childValue)) return false;

      this._checkAndSetValue(childSchema, childPath, childValue);
      return false;
    }

    // If it's a container - go deeper
    return true;
  }

  /**
   * Validate and set a value. You must pass list or param, not a container
   * @param {object} schema - schema for path
   * @param {string} path - to a param. (Not to container)
   * @param {*} value - value to set. (Not undefined and not an object)
   * @private
   */
  _checkAndSetValue(schema, path, value) {
    if (schema.type == 'list') {
      // For lists
      // TODO: do it for parametrized lists
      // TODO: validate all items in list
      this.setComposition(path, value);
    }
    else if (schema.type) {
      // For values
      if (this.validateValue(path, value)) {
        this.setComposition(path, value);
      }
      else {
        throw new Error(`Not valid value "${value}" of param "${path}"! See validation rules in your schema.`);
      }
    }
  }

  /**
   * Start query to driver for data.
   * @param {{type: string, path: string, requestValue: *}} params
   *     * type is one of: get, set, add, delete
   *     * path: full path in mold
   *     * requestValue: for "set" and "add" types - value to set
   * @returns {Promise}
   * @private
   */
  _startDriverQuery(params) {
    var driver = this._main.schemaManager.getDriver(params.path);

    var event = {
      ... params,
    };

    // if driver not defined - it means memory driver
    if (!driver) return new Promise((resolve) => {resolve()});

    return new Promise((resolve, reject) => {
      // TODO: сформировать подходящий для драйвера запрос
      // TODO:     * либо пользователь формирует
      // TODO:     * либо указать в схеме - указать модель

      return driver.middleware(event, resolve, reject);
    });
  }

}
