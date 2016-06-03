// It's runtime state manager
import _ from 'lodash';

import { eachOwnParam } from './helpers';
import Composition from './Composition';

export default class State {
  constructor() {
    this._composition = new Composition();
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
    if (this._composition.has(path)) {
      // if composition has a value - return it
      return this._composition.get(path);
    }
    else {
      this._composition.set(path, null);
      return null;

      // if doesn't have - check it for schema and return null and send request for driver

      // if it doesn't exist in schema - rise error
      // var handler = this._schemaManager.getHandler(path);
      // return handler.getValue(path);
    }
  }

  /**
   * Is has a path
   * @param path
   * @returns {boolean}
   */
  hasValue(path) {
    // var handler = this._schemaManager.getHandler(path);
    // return handler.hasValue(path);
  }

  /**
   * Set new value
   * @param path
   * @param value
   * @returns {object} promise
   */
  setValue(path, value) {
    // TODO: validate value - должен соответствовать схеме
    // var handler = this._schemaManager.getHandler(path);
    // return handler.setValue(path, value);
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
  // initDefaultValues(handler, root, schema) {
  //   // only our params, omit other handlers
  //   eachOwnParam(root, schema, (path, value) => {
  //     if (value.type == 'list') {
  //       handler.initDefaultValue(path, []);
  //     }
  //     else if (!_.isUndefined(value.default)) {
  //       handler.initDefaultValue(path, value.default);
  //     }
  //   });
  // }

  /**
   * 
   * @param {string} path - full path
   */
  resetToDefault(path) {

    var setToItem = (itemSchema) => {
      if (!_.isUndefined(itemSchema.default)) {
        // set a value
        this._composition.set(path, itemSchema.default);
      }
      else {
        // set null
        this._composition.set(path, null);
      }
    };

    var itemSchema = this._schemaManager.get(path);
    console.log(1111111, itemSchema)
    if (itemSchema.type) {
      // for item
      setToItem(itemSchema);
    }
    else {
      // for container, set on each child
      _.each(itemSchema, (value) => {
        setToItem(itemSchema);
      });
    }


    // TODO: в composition устанавливаем значение


  }
}
