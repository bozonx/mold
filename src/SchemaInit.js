import _ from 'lodash';

import { recursiveSchema } from './helpers';

/**
 * It generate runtime schema from raw schema and extract drivers and documents.
 * @class
 */
export default class SchemaInit {
  constructor(rawSchema, main) {
    this._main = main;
    this.schema = {};
    this.drivers = {};
    this.documents = {};

    recursiveSchema('', rawSchema, (newPath, value) => {
      if (value.driver) {
        this._initDriver(newPath, value);

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (_.isPlainObject(value.document)) {
        this._initDocument(newPath, value);

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (value.type == 'array') {
        // array
        this._initArray(newPath, value);

        // Go deeper
        return false;
      }
      else if (value.type == 'collection') {
        this._initCollection(newPath, value);

        // Go deeper
        return true;
      }
      else if (value.type) {
        // primitive
        this._initPrimitive(newPath, value);

        return false;
      }
      else {
        // container
        if (!_.isPlainObject(value)) throw new Error(`The container on a path "${path}" must be an object!`);
        _.set(this.schema, newPath, {});

        // Go deeper
        return true;
      }
    });
  }

  _initDriver(path, value) {
    if (!_.isPlainObject(value.schema))
      throw new Error(`On a path "${path}" driver must has a "schema" param.`);

    // Set driver to drivers list
    this.drivers[path] = value.driver;
    // Init driver
    value.driver.init(path, this._main);

    _.set(this.schema, path, value.schema);
  }

  _initDocument(path, value) {
    if (!_.isPlainObject(value.schema))
      throw new Error(`On a path "${path}" document must has a "schema" param.`);

    this.documents[path] = {
      ...value.document,
      pathToDocument: path,
    };

    _.set(this.schema, path, value.schema);
  }

  _initArray(path, value) {
    // TODO: если есть параметр itemType - проверить, чтобы его типы совпадали с существующими

    _.set(this.schema, path, value);
  }

  _initPrimitive(path, value) {
    // TODO: validate it
    _.set(this.schema, path, value);
  }

  _initCollection(path, value) {
    // collection
    if (!_.isPlainObject(value.item))
      throw new Error(`On a path "${path}" list must has an "item" param.`);

    // TODO: проверить - только одно поле, не больше не меньше, что является primary
    // TODO: primary id может быть только числом или строкой

    _.set(this.schema, path, {
      type: value.type,
      item: {},
    });
  }

}
