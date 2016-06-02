// It's runtime state manager
import _ from 'lodash';

import { eachOwnParam } from './helpers';

export default class State {
  constructor() {
  }

  init(schemaManager) {
    this._schemaManager = schemaManager;
  }

  /**
   * Get data by path
   * example:
   *     getValue('settings.showNotifications')
   *     // it returns promise with current value
   * @param path
   */
  getValue(path) {
    var handler = this._schemaManager.getHandler(path);
    return handler.getValue(path);
  }

  /**
   * Is has a path
   * @param path
   * @returns {boolean}
   */
  hasValue(path) {
    var handler = this._schemaManager.getHandler(path);
    return handler.hasValue(path);
  }

  /**
   * Set new value
   * @param path
   * @param value
   * @returns {object} promise
   */
  setValue(path, value) {
    var handler = this._schemaManager.getHandler(path);
    return handler.setValue(path, value);
  }

  /**
   * Validate value using validate settings by path
   * @param path
   * @param value
   */
  validate(path, value) {
    // TODO: сделать

  }


  /**
   * Set default values to state of handler
   * @param {object} handler
   * @param {string} root
   * @param {object} schema
   * @private
   */
  initDefaultValues(handler, root, schema) {
    // only our params, omit other handlers
    eachOwnParam(root, schema, (path, value) => {
      if (value.type == 'list') {
        handler.initDefaultValue(path, []);
      }
      else if (!_.isUndefined(value.default)) {
        handler.initDefaultValue(path, value.default);
      }
    });
  }
}
