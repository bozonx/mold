// It's schema manager
// You can set schema only once on creating instance
// You can't mutate a schema

import _ from 'lodash';

import ParamInstance from './instances/ParamInstance';
import ListInstance from './instances/ListInstance';
import ContainerInstance from './instances/ContainerInstance';

//import { eachHandler } from './helpers';


export default class SchemaManager {
  init(schema, state) {
    this._schema = schema;
    this._state = state;
    // TODO: нужно из default сделать type во всех элементах при валидации
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
  // initHandlers() {
  //   // TODO: переделать
  //   // TODO: может для драйверов сделать отдельный список???
  //   eachHandler('', this._schema, (path, value) => {
  //     // init handler
  //     value.handler.onInitializeHandler(path, value.schema, this);
  //   });
  // }
}
