// It's schema manager
// You can set schema only once on creating instance
// You can't mutate a schema

import _ from 'lodash';

import PrimitiveArray from './types/PrimitiveArray';
import Collection from './types/Collection';
import Container from './types/Container';
import Primitive from './types/Primitive';
import { convertToSchemaPath, getTheBestMatchPath } from './helpers';
import Memory from './drivers/Memory';
import SchemaInit from './SchemaInit';

export default class SchemaManager {
  init(schema, main) {
    this._rawSchema = schema;
    this._main = main;
    this.$defaultMemoryDb = {};

    var memoryDriver = new Memory({
      db: this.$defaultMemoryDb,
    });
    this.mainMemoryDriver = memoryDriver.schema({}, {}).driver;

    var completed = new SchemaInit(this._rawSchema, this._main);
    this._schema = completed.schema;
    this._drivers = completed.drivers;
    this._documents = completed.documents;
  }

  /**
   * get schema part by path
   * @param {string} path - absolute path
   * @returns {object} schema
   */
  get(path) {
    if (path === '') return this.getFullSchema();

    var schemaPath = convertToSchemaPath(path);

    var schema = _.get(this._schema, schemaPath);
    if (_.isUndefined(schema)) throw new Error(`Schema on path "${schemaPath}" doesn't exists`);

    return schema;
  }

  /**
   * Has a param on path
   * Path = '' means root.
   * @param {string} path - absolute path
   * @returns {boolean} If path = '' it means root and return true
   */
  has(path) {
    // TODO: test it or remove
    if (path === '') return true;

    var schemaPath = convertToSchemaPath(path);

    return _.has(this._schema, schemaPath);
  }

  /**
   * Get full schema
   * @returns {object} schema
   */
  getFullSchema() {
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

    if (!schema.type) {
      instance = new Container(this._main);
    }
    else if (schema.type == 'collection') {
      instance = new Collection(this._main);
    }
    else if (schema.type == 'array') {
      instance = new PrimitiveArray(this._main);
    }
    else if (schema.type == 'boolean' || schema.type == 'string' || schema.type == 'number'){
      instance = new Primitive(this._main);
    }

    // It's need for creating collection child
    instance.$init(path, schema);

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

    var matchPath = getTheBestMatchPath(path, _.keys(this._documents));

    return this._documents[matchPath];
  }

  /**
   * Get driver. If it doesnt exists, returns undefined
   * @param {string} path - absolute path for driver or its child
   * @returns {object|undefined}
   */
  getDriver(path) {
    if (!_.isString(path))
      throw new Error(`You must pass the path argument!`);

    var matchPath = getTheBestMatchPath(path, _.keys(this._drivers));

    if (matchPath)
      return this._drivers[matchPath];

    // no-one - memory driver
    return this.mainMemoryDriver;
  }

}
