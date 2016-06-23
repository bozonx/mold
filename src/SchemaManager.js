// It's schema manager
// You can set schema only once on creating instance
// You can't mutate a schema

import _ from 'lodash';

import PrimitiveArray from './types/PrimitiveArray';
import Collection from './types/Collection';
import Container from './types/Container';
import Primitive from './types/Primitive';
import { recursiveSchema, convertToSchemaPath } from './helpers';

export default class SchemaManager {
  init(schema, main) {
    this._schema = null;
    this._rawSchema = schema;
    this._main = main;
    this._drivers = {};
    this._documents = {};

    this._initSchema();
  }

  /**
   * get schema part by path
   * @param {string} path - absolute path
   * @returns {object} schema
   */
  get(path) {
    if (path === '') return this.getFullSchema();

    var schemaPath = convertToSchemaPath(path);

    // TODO: do it immutable
    var schema = _.get(this._schema, schemaPath);
    if (_.isUndefined(schema)) throw new Error(`Schema on path "${schemaPath}" doesn't exists`);

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

    var schemaPath = convertToSchemaPath(path);

    return _.has(this._schema, schemaPath);
  }

  /**
   * Get full schema
   * @returns {object} schema
   */
  getFullSchema() {
    // TODO: do it immutable
    return this._schema;
  }

  /**
   * Get type instance
   * @param {string} path - absolute path
   * @returns {object} - instance of type
   */
  getInstance(path) {
    var instance;
    // It rise an error if path doesn't consist with schema
    var schema = this.get(path);

    if (schema.type == 'boolean' || schema.type == 'string' || schema.type == 'number'){
      instance = new Primitive(this._main);
    }
    else if (schema.type == 'array') {
      instance = new PrimitiveArray(this._main);
    }
    else if (schema.type == 'collection') {
      instance = new Collection(this._main);
    }
    else if (!schema.type) {
      instance = new Container(this._main);
    }

    // TODO: может инициализировать  всё сразу в конструкторе???

    instance.init(path, schema);

    return instance;
  }

  /**
   * Get document. If it doesn't exists, returns undefined
   * @param {string} path - absolute path for document or its child
   * @returns {object|undefined}
   */
  getDocument(path) {
    if (!_.isString(path))
      throw new Error(`You must pass the path argument!`);

    return _.find(this._documents, (value, documentPath) => {
      return path.indexOf(documentPath) === 0;
    });
  }

  /**
   * Get driver. If it doesnt exists, returns undefined
   * @param {string} path - absolute path for driver or its child
   * @returns {object|undefined}
   */
  getDriver(path) {
    if (!_.isString(path))
      throw new Error(`You must pass the path argument!`);

    var driverPaths = _.map(this._drivers, (value, driverPath) => {
      if (path.indexOf(driverPath) === 0) return driverPath;
    });
    driverPaths = _.compact(driverPaths);

    if (driverPaths.length > 1) {
      // two or more drivers - get the longest
      // TODO: !!! do it and test it
      console.log(5555555555555555)
    }
    if (driverPaths.length === 1) {
      // one driver
      return this._drivers[driverPaths[0]];
    }
    else {
      // no-one - memory driver
      return this._main.memory;
    }
  }

  /**
   * Initializing the schema:
   * * Validate schema
   * * extract all drivers from schema to this._drivers and init them
   * * extract all documents from schema to this._documents
   */
  _initSchema() {
    this._schema = {};

    recursiveSchema('', this._rawSchema, (newPath, value) => {
      if (value.driver) {
        this._initDriver(newPath, value);

        // Go through inner param 'schema'
        return 'schema';
      }
      else if (_.isObject(value.document)) {
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
        _.set(this._schema, newPath, {});

        // Go deeper
        return true;
      }
    });
  }

  _initDriver(path, value) {
    if (!_.isPlainObject(value.schema))
      throw new Error(`On a path "${path}" driver must has a "schema" param.`);

    // Set driver to drivers list
    this._drivers[path] = value.driver;
    // Init driver
    value.driver.init(path, this._main);

    _.set(this._schema, path, value.schema);
  }

  _initDocument(path, value) {
    if (!_.isPlainObject(value.schema))
      throw new Error(`On a path "${path}" document must has a "schema" param.`);

    this._documents[path] = {
      ...value.document,
      pathToDocument: path,
    };

    _.set(this._schema, path, value.schema);
  }

  _initArray(path, value) {
    // TODO: если есть параметр itemType - проверить, чтобы его типы совпадали с существующими

    _.set(this._schema, path, value);
  }

  _initCollection(path, value) {
    // collection
    if (!_.isPlainObject(value.item))
      throw new Error(`On a path "${path}" list must has an "item" param.`);

    // TODO: проверить - только одно поле, не больше не меньше является primary
    // TODO: primary id может быть только числом (или может ещё строкой)

    _.set(this._schema, path, {
      type: value.type,
      item: {},
    });
  }

  _initPrimitive(path, value) {
    // TODO: validate it
    _.set(this._schema, path, value);
  }

}

