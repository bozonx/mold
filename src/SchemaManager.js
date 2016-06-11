// It's schema manager
// You can set schema only once on creating instance
// You can't mutate a schema

import _ from 'lodash';

import ParamInstance from './instances/ParamInstance';
import ListInstance from './instances/ListInstance';
import ContainerInstance from './instances/ContainerInstance';

import { recursiveSchema } from './helpers';


export default class SchemaManager {
  init(schema, state) {
    this._schema = null;
    this._rawSchema = schema;
    this._state = state;
    this._drivers = {};

    this.initSchema();
  }

  /**
   * get schema part by path
   * @param {string} path - absolute path
   * @returns {object}
   */
  get(path) {
    if (path === '') return this.getFullSchema();

    // TODO: do it immutable
    var schema = _.get(this._schema, path);
    if (_.isUndefined(schema)) throw new Error(`Schema on path "${path}" doesn't exists`);

    return schema;
  }

  /**
   * Has a param on path
   * Path = '' means root.
   * @param {string} path - absolute path
   * @returns {boolean}
   */
  has(path) {
    if (path === '') return true;
    return _.has(this._schema, path);
  }

  /**
   * Get full schema
   * @returns {object}
   */
  getFullSchema() {
    // TODO: do it immutable
    return this._schema;
  }


  /**
   * Get list or item or container instance by a path
   * @param {string} path - absolute path
   * @returns {object} - instance of param or list or container
   */
  getInstance(path) {
    var instance;
    // It rise an error if path doesn't consist with schema
    var schema = this.get(path);
    if (!schema.type) {
      instance = new ContainerInstance(this._state, this);
    }
    else if (schema.type === 'list') {
      instance = new ListInstance(this._state, this);
    }
    else {
      instance = new ParamInstance(this._state, this);
    }

    instance.init(path, schema);

    return instance;
  }


  /**
   * Validate schema and initialize drivers
   * Remove handlers from schema and move it to this._drivers
   */
  initSchema() {
    this._schema = {};

    // TODO: нужно из default сделать type во всех элементах при валидации
    // TODO: сделать {type: ..., default(or test): ...} из примитивных элементов name: 'value' | 1 | false

    recursiveSchema('', this._rawSchema, (newPath, value, itemName) => {
      if (value.driver) {
        this._drivers[newPath] = value.driver;
        // TODO: local events
        value.driver.init(newPath, this, this._state, {});

        if (!_.isObject(value.schema))
          throw new Error(`On a path "${newPath}" driver must has a "schema" param.`);

        _.set(this._schema, newPath, value.schema);
        // Go throw inner param 'schema'
        return 'schema';
      }
      else if (value.type == 'list') {
        // list
        if (!_.isObject(value.item))
          throw new Error(`On a path "${newPath}" list must has an "item" param.`);

        _.set(this._schema, newPath, {
          type: value.type,
          item: {},
        });
        // Go deeper
        return 'item';
      }
      else if (value.type) {
        // param
        // TODO: validate it
        _.set(this._schema, newPath, value);
        return false;
      }
      else {
        // container
        _.set(this._schema, newPath, {});
        // Go deeper
        return true;
      }
    });
  }

  /**
   * Get driver. If it doesnt exists, returns undefined
   * @param {string} path - absolute path
   * @returns {object|undefined}
   */
  getDriver(path) {
    return _.find(this._drivers, (driver, driverPath) => {
      return path.indexOf(driverPath) === 0;
    });
  }

}
