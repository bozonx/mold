// It's runtime state manager
import _ from 'lodash';

import { recursiveSchema } from './helpers';
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
   * Set new value silently to state.
   * You can set all values to branch if you pass a container.
   * @param {string} path - absolute path
   * @param {*} value
   * @returns {object} promise
   */
  setSilent(path, value) {
    // If it's a bad request for non existent param
    if (!this._schemaManager.has(path))
      throw new Error(`Can't set a value, a param "${path}" doesn't exists in schema!`);

    var schema = this._schemaManager.get(path);
    if (schema.type) {
      // If it's a param - just set a value
      this._checkAndSetValue(schema, path, value);
    }
    else {
      // If it's a containter - set value for all children
      recursiveSchema(path, schema, (childPath, childSchema, childName) => {
        if (childSchema.type) {
          // param
          var valuePath = childPath;
          if (path !== '') valuePath = childPath.replace(path + '.', '');

          var childValue = _.get(value, valuePath);

          // If value doesn't exist for this schema brunch - do nothing
          if (_.isUndefined(childValue)) return false;

          this._checkAndSetValue(childSchema, childPath, childValue);
          return false;
        }

        // If it's a container - go deeper
        return true;
      });
    }

  }

  /**
   * Validate and set a value.
   * @param {object} schema - schema for path
   * @param {string} path - to a param. (Not to container)
   * @param {*} value - value to set. (Not undefined and not an object)
   * @returns {*}
   * @private
   */
  _checkAndSetValue(schema, path, value) {
    // TODO: maybe return promise always???

    if (schema.type == 'list') {
      // For lists
      // TODO: do it
    }
    else if (schema.type) {
      // For values
      if (this.validateValue(path, value)) {
        return this.setDirectly(path, value);
      }
      throw new Error(`Not valid value "${value}" of param "${path}"! See validation rules in your schema.`);
    }
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
   * Reset param or children params to defaults
   * @param {string} path - absolute path
   */
  resetToDefault(path) {
    var setToItem = (itemPath, itemSchema) => {
      if (!_.isUndefined(itemSchema.default)) {
        // set a value
        this.setDirectly(itemPath, itemSchema.default);
      }
      else {
        // set null
        this.setDirectly(itemPath, null);
      }
    };

    var itemSchema = this._schemaManager.get(path);
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

}
