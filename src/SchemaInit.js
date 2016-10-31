import _ from 'lodash';

import { recursiveSchema } from './helpers';

/**
 * It inits and validate the schema.
 * @class
 */
export default class SchemaInit {
  constructor(rawSchema, main) {
    this._main = main;
    this._schema = rawSchema;
  }

  init() {
    var drivers = {};

    recursiveSchema('', this._schema, (newPath, value) => {
      if (value.driver) {
        // TODO: разобраться
        drivers[newPath] = this._initDriver(newPath, value);

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (value.type == 'document') {
        if (!_.isPlainObject(value.schema))
          throw new Error(`Schema definition of document on "${newPath}" must have a "schema" param!`);

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (value.type == 'container') {
        if (!_.isPlainObject(value.schema))
          throw new Error(`Schema definition of container on "${newPath}" must have a "schema" param!`);

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (value.type == 'documentsCollection') {
        if (!_.isPlainObject(value.item))
          throw new Error(`Schema definition of documentsCollection on "${newPath}" must have an "item" param!`);

        // Go through inner param 'item'
        return 'item';
      }
      else if (value.type == 'collection') {
        if (!_.isPlainObject(value.item))
          throw new Error(`Schema definition of collection on "${newPath}" must have an "item" param!`);

        // Go through inner param 'item'
        return 'item';
      }
      else if (value.type == 'array') {
        // TODO: если есть параметр itemType - проверить, чтобы его типы совпадали с существующими

        // don't go deeper
        return false;
      }
      else if (value.type == 'number' || value.type == 'string' || value.type == 'boolean') {

        // don't go deeper
        return false;
      }
      else {
        throw new Error(`Unknown schema node ${JSON.stringify(value)} !`);
      }
    });

    return drivers;
  }

  _initDriver(path, value) {
    if (!_.isPlainObject(value.schema))
      throw new Error(`On a path "${path}" driver must has a "schema" param.`);

    // Init driver
    value.driver.init(path, this._main);

    // Set driver to drivers list
    return value.driver;

    //_.set(this.schema, path, value.schema);
  }

}
