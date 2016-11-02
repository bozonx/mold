import _ from 'lodash';

import { recursiveSchema } from './helpers';

// TODO: разъединить в отдельные ф-и

/**
 * It inits and validate the schema.
 * @class
 */
export default function(rawSchema) {
  var drivers = {};
  var initialStorage = {};

  // Validate schema
  recursiveSchema('', rawSchema, (newPath, value) => {
    if (value.driver) {
      // TODO: разобраться
      //drivers[newPath] = this._initDriver(newPath, value);

      // _initDriver(path, value) {
      //   if (!_.isPlainObject(value.schema))
      //     throw new Error(`On a path "${path}" driver must has a "schema" param.`);
      //
      //   // Init driver
      //   value.driver.init(path, this._main);
      //
      //   // Set driver to drivers list
      //   return value.driver;
      //
      //   //_.set(this.schema, path, value.schema);
      // }

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
    else if (value.type == 'pagedCollection') {
      if (!_.isPlainObject(value.item))
        throw new Error(`Schema definition of pagedCollection on "${newPath}" must have an "item" param!`);

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
    else if (_.includes(['boolean', 'string', 'number'], value.type)) {
      // don't go deeper
      return false;
    }
    else {
      throw new Error(`Unknown schema node ${JSON.stringify(value)} !`);
    }
  });

  // Init storage. Collection's init behavior if different than in schema init.
  recursiveSchema('', rawSchema, (newPath, value) => {
    if (value.type == 'document') {
      _.set(initialStorage, newPath, {});

      // Go through inner param 'schema'
      return 'schema';
    }
    else if (value.type == 'container') {
      _.set(initialStorage, newPath, {});

      // Go through inner param 'schema'
      return 'schema';
    }
    else if (value.type == 'documentsCollection') {
      _.set(initialStorage, newPath, []);

      // don't go deeper
      return false;
    }
    else if (value.type == 'pagedCollection') {
      _.set(initialStorage, newPath, []);

      // don't go deeper
      return false;
    }
    else if (value.type == 'collection') {
      _.set(initialStorage, newPath, []);

      // don't go deeper
      return false;
    }
    else if (value.type == 'array') {
      _.set(initialStorage, newPath, []);

      // don't go deeper
      return false;
    }
    else if (_.includes(['boolean', 'string', 'number'], value.type)) {
      _.set(initialStorage, newPath, null);

      // don't go deeper
      return false;
    }
  });

  return { initialStorage, drivers };
}