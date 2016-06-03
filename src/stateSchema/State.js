// It's runtime state manager
import _ from 'lodash';

//import { eachOwnParam } from './helpers';
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
   * @param {string} path - absolute path
   * @returns {Promise}
   */
  getValue(path) {
    // TODO: maybe return promise always???

    if (this._composition.has(path)) {
      // if composition has a value - return it
      return this._composition.get(path);
    }
    else if (this._schemaManager.has(path)) {
      // Init a value.
      // In common use it doesn't happens because composition param initializing on creating new item/list instance
      this._composition.set(path, null);
      return null;
    }

    // It's a bad request for non existent param
    throw new Error(`Can't get a value, a param ${path} doesn't exists in schema!`);
  }

  /**
   * Get value without any checks
   * @param path
   */
  getDirectly(path) {
    return this._composition.get(path);
  }

  /**
   * Set new value to state
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {object} promise
   */
  setValue(path, value) {
    // TODO: rise an event

    this.setSilent(path, value);
  }

  /**
   * Set new value to state silently
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {object} promise
   */
  setSilent(path, value) {
    // TODO: maybe return promise always???

    if (this._schemaManager.has(path)) {
      if (this.validateValue(path, value)) {
        return this.setDirectly(path, value);
      }
      throw new Error(`Not valid value "${value}" of param "${path}"! See validation rules in your schema.`);
    }

    // It's a bad request for non existent param
    throw new Error(`Can't set a value, a param "${path}" doesn't exists in schema!`);
  }

  /**
   * Set value without any checks
   * @param path
   * @param value
     */
  setDirectly(path, value) {
    this._composition.set(path, value);
  }

  /**
   * Validate value using validate settings by path
   * @param {string} path - absolute path
   * @param {} value
   * @returns {boolean}
   */
  validateValue(path, value) {
    // TODO: сделать
    return true;
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
   * @param {string} path - absolute path
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
