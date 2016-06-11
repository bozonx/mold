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
        
        if (!_.isObject(value.item))
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


  // /**
  //  * Find handler for path
  //  * @param {string} path
  //  * @returns {object | undefined} return handler or undefined
  //  */
  // getHandler(path) {
  //
  //   // TODO: !!!! похоже уже не нужно
  //
  //
  //   var handler = null;
  //
  //   // TODO: сделать по другому - восстановить полный путь с innerSchema, потом заменить их на handler, и потом брать последний handler
  //
  //   var pathParts = path.split('.');
  //   // remove last element
  //   if (pathParts.length >= 2) pathParts.pop();
  //
  //   for (var i = pathParts.length; i > 0; i--) {
  //     // at last time i = 1
  //     var newPath = pathParts.slice(0, i).concat(['handler']).join('.');
  //     if (_.has(this._schema, newPath)) {
  //       handler = _.get(this._schema, newPath);
  //       break;
  //     }
  //   }
  //
  //   if (handler) {
  //     return handler;
  //   }
  //   else {
  //     throw new Error(`Can't find any handlers`);
  //   }
  // }
  //

}
