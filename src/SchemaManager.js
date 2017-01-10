import _ from 'lodash';

import { convertFromLodashToSchema, convertFromSchemaToLodash, getTheBestMatchPath } from './helpers';
import Memory from './drivers/Memory';
import { eachSchema, concatPath, splitPath, joinPath } from './helpers';

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
    this._drivers = {};
    this._registeredTypes = {};

    const memoryDriver = new Memory({
      db: this.$defaultMemoryDb,
    });
    this.mainMemoryDriver = memoryDriver.instance({});

    this._checkSchema(this._schema);
  }

  registerType(typeName, typeClass) {
    this._registeredTypes[typeName] = typeClass;
  }

  /**
   * get schema part by path
   * @param {string} schemaPath - absolute mold or schema path
   * @returns {object} schema like {type, driver, params, schema}
   */
  getSchema(schemaPath) {
    if (schemaPath === '') return this.getFullSchema();

    // let schemaPath = moldOrSchemaPath;
    // if (!moldOrSchemaPath.match(/\.(schema|item)/)) {
    //   schemaPath = convertFromLodashToSchema(moldOrSchemaPath);
    // }

    const schema = _.get(this._schema, schemaPath);

    if (_.isUndefined(schema)) this._main.$$log.fatal(`Schema on path "${schemaPath}" doesn't exists`);

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
   * Get driver by path.
   * @param {string} driverPath - absolute path to driver
   * @returns {object|undefined} If driver doesnt exists, returns undefined
   */
  getDriver(driverPath) {
    if (driverPath) return this._drivers[driverPath];

    // no-one === default memory driver
    return this.mainMemoryDriver;
  }

  getClosestDriverPath(moldPath) {
    if (!_.isString(moldPath))
      this._main.$$log.fatal(`You must pass the moldPath argument!`);

    return getTheBestMatchPath(moldPath, _.keys(this._drivers));
  }

  /**
   * Get instance of type
   * @param {string} path - absolute path or relative if context is used
   * @param {object} context - instance of root element
   * @returns {object|undefined} - instance of type
   */
  getInstance(path, context=undefined) {
    if (!_.isString(path)) this._main.$$log.fatal(`You must pass a path argument.`);
    if (!path && !context) this._main.$$log.fatal(`Path is empty.`);

    let rootInstance;
    let childPathParts;
    let fullMoldPath;

    if (context) {
      if (!path) return context;

      // use received context
      fullMoldPath = concatPath(context.root, path);
      childPathParts = splitPath(path);
      rootInstance = context;
    }
    else {
      // use instance of first level of path
      fullMoldPath = path;
      const pathParts = splitPath(fullMoldPath);
      childPathParts = pathParts.slice(1);
      // TODO: передать schemaPath
      rootInstance = this.$getInstanceByFullPath(pathParts[0]);

      // if there is only first level of path - return its instance.
      if (childPathParts.length === 0) return rootInstance;
    }

    const result = this._findInstance(childPathParts, rootInstance);

    if (result) return result;

    this._main.$$log.fatal(`Can't find a element on path "${fullMoldPath}".`);
  }

  /**
   * It just returns an instance
   * @param fullMoldPath
   * @param fullSchemaPath - if undefined - it converts fullMoldPath to schema path
   */
  $getInstanceByFullPath(fullMoldPath, fullSchemaPath=undefined) {
    // TODO: fullSchemaPath обязательный!!!!!
    const preparedSchemaPath = (fullSchemaPath) ? fullSchemaPath : convertFromLodashToSchema(fullMoldPath);

    // It rise an error if path doesn't consist with schema
    const schema = this.getSchema(preparedSchemaPath);
    const instance = new this._registeredTypes[schema.type](this._main);
    instance.$init(fullMoldPath, preparedSchemaPath, schema);

    return instance;
  }

  _findInstance(pathParts, rootInstance) {
    let currentInstance = rootInstance;
    let result = undefined;
    _.each(pathParts, (currentPathPiece, index) => {
      // TODO: не нужно - удалить
      const restOfPath = joinPath(pathParts.slice(index + 1));

      if (index === pathParts.length - 1) {
        // the last part of path
        result = currentInstance.$getChildInstance(currentPathPiece, restOfPath);
      }
      else {
        // not last

        if (!currentInstance.$getChildInstance)
          this._main.$$log.fatal(`Can't find a element on path "${fullMoldPath}".`);

        currentInstance = currentInstance.$getChildInstance(currentPathPiece, restOfPath);
      }
    });
    return result;
  }

  _checkSchema(rawSchema) {
    // TODO: запускать метод у каждого типа
    // Validate schema
    eachSchema(rawSchema, (schemaPath, value) => {
      if (_.includes(
          ['documentsCollection', 'document', 'container', 'collection'], value.type)
          && value.driver) {
        value.driver.init(convertFromSchemaToLodash(schemaPath), this._main);
        this._drivers[schemaPath] = value.driver;
      }
      if (value.type == 'document') {
        if (!_.isPlainObject(value.schema))
          this._main.$$log.fatal(`Schema definition of document on "${schemaPath}" must have a "schema" param!`);
      }
      else if (value.type == 'container') {
        if (!_.isPlainObject(value.schema))
          this._main.$$log.fatal(`Schema definition of container on "${schemaPath}" must have a "schema" param!`);
      }
      else if (value.type == 'documentsCollection') {
        if (!_.isPlainObject(value.item))
          this._main.$$log.fatal(`Schema definition of documentsCollection on "${schemaPath}" must have an "item" param!`);
      }
      else if (value.type == 'pagedCollection') {
        if (!_.isPlainObject(value.item))
          this._main.$$log.fatal(`Schema definition of pagedCollection on "${schemaPath}" must have an "item" param!`);
      }
      else if (value.type == 'collection') {
        if (!_.isPlainObject(value.item))
          this._main.$$log.fatal(`Schema definition of collection on "${schemaPath}" must have an "item" param!`);
      }
      else if (value.type == 'array') {
        // TODO: если есть параметр itemType - проверить, чтобы его типы совпадали с существующими
      }
      else if (_.includes(['boolean', 'string', 'number'], value.type)) {
      }
      else {
        this._main.$$log.fatal(`Unknown schema node ${JSON.stringify(value)} !`);
      }
    });
  }
}
