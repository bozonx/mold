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
        drivers[newPath] = this._initDriver(newPath, value);

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (_.isPlainObject(value.document)) {
        this._initDocument(newPath, value);

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (value.type == 'collection') {
        this._initCollection(newPath, value);

        // Go through inner param 'item'
        return 'item';
      }
      else if (value.type == 'container') {
        // container
        if (!_.isPlainObject(value)) throw new Error(`The container on a path "${path}" must be an object!`);
        //_.set(this.schema, newPath, {});

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (value.type == 'array') {
        // array
        this._initArray(newPath, value);

        // don't go deeper
        return false;
      }
      else if (value.type == 'number' || value.type == 'string' || value.type == 'boolean') {
        // primitive
        this._initPrimitive(newPath, value);

        // don't go deeper
        return false;
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

  // _initDocument(path, value) {
  //   if (!_.isPlainObject(value.schema))
  //     throw new Error(`On a path "${path}" document must has a "schema" param.`);
  //
  //   this.documents[path] = {
  //     ...value.document,
  //     pathToDocument: path,
  //   };
  //
  //   _.set(this.schema, path, value.schema);
  // }

  _initArray(path, value) {
    // TODO: если есть параметр itemType - проверить, чтобы его типы совпадали с существующими

    //_.set(this.schema, path, value);
  }

  _initPrimitive(path, value) {
    // TODO: validate it
    //_.set(this.schema, path, value);
  }

  _initCollection(path, value) {
    // collection
    if (!_.isPlainObject(value.item))
      throw new Error(`On a path "${path}" list must has an "item" param.`);

    // TODO: проверить - только одно поле, не больше не меньше, что является primary
    // TODO: primary id может быть только числом или строкой

    // _.set(this.schema, path, {
    //   type: value.type,
    //   item: {},
    // });
  }

}
