// It's schema manager
// You can set schema only once on creating instance
// You can't mutate a schema

import _ from 'lodash';

import { eachHandler } from './helpers';


export default class SchemaManager {
  constructor() {
  }

  init(schema, state) {
    this._schema = schema;
    this._state = state;
    // TODO: нужно из default сделать type во всех элементах при валидации
  }

  /**
   * get schema path
   * @param path
   */
  get(path) {
    // TODO: do it immutable
    // TODO: do it
  }

  getSchema() {
    // TODO: do it immutable
    return this._schema;
  }

  /**
   * Find handler for path
   * @param {string} path
   * @returns {object | undefined} return handler or undefined
   */
  getHandler(path) {
    var handler = null;

    // TODO: сделать по другому - восстановить полный путь с innerSchema, потом заменить их на handler, и потом брать последний handler

    var pathParts = path.split('.');
    // remove last element
    if (pathParts.length >= 2) pathParts.pop();

    for (var i = pathParts.length; i > 0; i--) {
      // at last time i = 1
      var newPath = pathParts.slice(0, i).concat(['handler']).join('.');
      if (_.has(this._schema, newPath)) {
        handler = _.get(this._schema, newPath);
        break;
      }
    }

    if (handler) {
      return handler;
    }
    else {
      throw new Error(`Can't find any handlers`);
    }
  }

  initHandlers() {
    // TODO: может для драйверов сделать отдельный список???
    eachHandler('', this._schema, (path, value) => {
      // init handler
      value.handler.onInitializeHandler(path, value.schema, this);
    });
  }
}
