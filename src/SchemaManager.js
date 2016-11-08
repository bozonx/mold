import _ from 'lodash';

import PagedCollection from './types/PagedCollection';
import Collection from './types/Collection';
import Container from './types/Container';
import Document from './types/Document';
import DocumentsCollection from './types/DocumentsCollection';
import { convertFromLodashToSchema, getTheBestMatchPath } from './helpers';
import Memory from './drivers/Memory';
import { eachSchema } from './helpers';


/**
 * It's schema manager
 * You can set schema only once on creating instance
 * You can't mutate a schema
 * @class
 */
export default class SchemaManager {
  init(schema, main) {
    this._schema = schema;
    this._main = main;
    this.$defaultMemoryDb = {};

    var memoryDriver = new Memory({
      db: this.$defaultMemoryDb,
    });
    this.mainMemoryDriver = memoryDriver.schema({}, {}).driver;

    this._checkSchema(this._schema);

    // var drivers = checkSchemaAndInitStore(this._schema);
    // this._drivers = drivers;
  }

  /**
   * get schema part by path
   * @param {string} path - absolute path in lodash format
   * @returns {object} schema like {type, driver, params, schema}
   */
  get(path) {
    if (path === '') return this.getFullSchema();

    var schemaPath = convertFromLodashToSchema(path);
    var schema = _.get(this._schema, schemaPath);

    if (_.isUndefined(schema)) throw new Error(`Schema on path "${schemaPath}" doesn't exists`);

    return schema;
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

    if (schema.type == 'container')                 instance = new Container(this._main);
    else if (schema.type == 'collection')           instance = new Collection(this._main);
    else if (schema.type == 'pagedCollection')      instance = new PagedCollection(this._main);
    else if (schema.type == 'document')             instance = new Document(this._main);
    else if (schema.type == 'documentsCollection')  instance = new DocumentsCollection(this._main);
    else if (schema.type == 'array') {
      throw new Error(`You can't get instance of primitive array!`);
    }
    else if (schema.type == 'boolean' || schema.type == 'string' || schema.type == 'number'){
      throw new Error(`You can't get instance of primitive!`);
    }
    else {
      throw new Error(`No one type have found!`);
    }

    // It's need for creating collection child
    instance.$init(path);

    return instance;
  }

  /**
   * Get driver. If it doesnt exists, returns undefined
   * @param {string} path - absolute path for driver or its child
   * @returns {object|undefined}
   */
  getDriver(path) {
    // TODO: драйверы в списке должны быть просто ссылками на драйверы в схеме

    if (!_.isString(path))
      throw new Error(`You must pass the path argument!`);

    var matchPath = getTheBestMatchPath(path, _.keys(this._drivers));

    if (matchPath)
      return this._drivers[matchPath];

    // no-one = memory driver
    return this.mainMemoryDriver;
  }

  _checkSchema(rawSchema) {
    var drivers = {};

    // Validate schema
    eachSchema(rawSchema, (schemaPath, value) => {
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

      }


      if (value.type == 'document') {
        if (!_.isPlainObject(value.schema))
          throw new Error(`Schema definition of document on "${schemaPath}" must have a "schema" param!`);
      }
      else if (value.type == 'container') {
        if (!_.isPlainObject(value.schema))
          throw new Error(`Schema definition of container on "${schemaPath}" must have a "schema" param!`);
      }
      else if (value.type == 'documentsCollection') {
        if (!_.isPlainObject(value.item))
          throw new Error(`Schema definition of documentsCollection on "${schemaPath}" must have an "item" param!`);
      }
      else if (value.type == 'pagedCollection') {
        if (!_.isPlainObject(value.item))
          throw new Error(`Schema definition of pagedCollection on "${schemaPath}" must have an "item" param!`);
      }
      else if (value.type == 'collection') {
        if (!_.isPlainObject(value.item))
          throw new Error(`Schema definition of collection on "${schemaPath}" must have an "item" param!`);
      }
      else if (value.type == 'array') {
        // TODO: если есть параметр itemType - проверить, чтобы его типы совпадали с существующими
      }
      else if (_.includes(['boolean', 'string', 'number'], value.type)) {
      }
      else {
        throw new Error(`Unknown schema node ${JSON.stringify(value)} !`);
      }
    });
  }
}
