import _ from 'lodash';

import { convertFromLodashToSchema, convertFromSchemaToLodash, getTheBestMatchPath } from './helpers';
import Memory from './drivers/Memory';
import { eachSchema, splitPath } from './helpers';


/**
 * It's schema manager
 * You can set schema only once on creating instance
 * You can't mutate a schema
 * @class
 */
export default class SchemaManager {
  constructor(main) {
    this._main = main;
    this.$defaultMemoryDb = {};
    this._drivers = {};
    this._registeredTypes = {};
  }

  init(schema) {
    this._schema = schema;

    const memoryDriver = new Memory({
      db: this.$defaultMemoryDb,
    });
    this.mainMemoryDriver = memoryDriver.instance({});
    this._checkSchema();
  }

  registerType(typeName, typeClass) {
    this._registeredTypes[typeName] = typeClass;
  }

  /**
   * Get full schema
   * @returns {object} schema
   */
  getFullSchema() {
    return this._schema;
  }

  /**
   * get schema part by path
   * @param {string} schemaPath - absolute mold or schema path
   * @returns {object} schema part on path
   */
  getSchema(schemaPath) {
    if (schemaPath === '') return this.getFullSchema();

    const schema = _.get(this._schema, schemaPath);
    if (_.isUndefined(schema)) this._main.$$log.fatal(`Schema on path "${schemaPath}" doesn't exists`);

    return schema;
  }

  /**
   * Get driver on path or upper on path.
   * It no one driver has found it returns defaultDriver (memory)
   * @param pathInSchema
   * @return {Object|undefined}
   */
  getDriver(pathInSchema) {
    const driverRoot = this.getClosestDriverPath(pathInSchema);

    const driver = this.getDriverStrict(driverRoot);

    if (driver) return driver;

    // else return default memory driver
    return this.mainMemoryDriver;
  }

  /**
   * Get driver by path.
   * @param {string} driverPath - absolute path to driver
   * @returns {object|undefined} If driver doesnt exists, returns undefined
   */
  getDriverStrict(driverPath) {
    if (driverPath) return this._drivers[driverPath];

    // if not driverPath it means default memory driver
    return this.mainMemoryDriver;
  }

  /**
   * Return driver path which is deriver specified on schema.
   * @param {string} moldPath
   * @return {string|undefined} real driver path
   */
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
    if (!path && context) return context;

    let rootInstance;
    let childPathParts;

    if (context) {
      // use received context
      childPathParts = splitPath(path);
      rootInstance = context;
    }
    else {
      // use instance of first level of path
      const pathParts = splitPath(path);
      // get path parts after start from index of 1
      childPathParts = pathParts.slice(1);
      // get root instance
      rootInstance = this.$getInstanceByFullPath({
        mold: pathParts[0],
        schema: convertFromLodashToSchema(pathParts[0]),
        storage: pathParts[0],
      });

      // if there is only first level of path - return its instance.
      if (childPathParts.length === 0) return rootInstance;
    }

    return this._findInstance(childPathParts, rootInstance);
  }

  /**
   * It just returns an instance
   * @param {{mold: string, schema: string, storage: string}} paths
   */
  $getInstanceByFullPath(paths) {
    // It rise an error if path doesn't consist with schema
    const schema = this.getSchema(paths.schema);
    const instance = new this._registeredTypes[schema.type](this._main);
    instance.$init(paths, schema);

    return instance;
  }

  _checkSchema() {
    eachSchema(this._schema, (schemaPath, schema) => {
      // init driver if it has set
      if (schema.driver) {
        schema.driver.init(convertFromSchemaToLodash(schemaPath), this._main);
        this._drivers[schemaPath] = schema.driver;
      }

      // schema validation
      if (this._registeredTypes[schema.type]) {
        if (this._registeredTypes[schema.type].validateSchema) {
          const result = this._registeredTypes[schema.type].validateSchema(schema, schemaPath);
          if (_.isString(result)) this._main.$$log.fatal(result);
        }
      }
      else if (!_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
        this._main.$$log.fatal(`Unknown schema node ${JSON.stringify(schema)} !`);
      }
    });
  }

  _findInstance(pathParts, rootInstance) {
    let currentInstance = rootInstance;
    let result = undefined;
    _.each(pathParts, (currentPathPiece, index) => {
      if (index === pathParts.length - 1) {
        // the last part of path
        result = currentInstance.$getChildInstance(currentPathPiece);
      }
      else {
        // not last
        // all the parents have to implement of $getChildInstance method.
        if (!currentInstance.$getChildInstance)
          this._main.$$log.fatal(`There is no method "$getChildInstance" of ${currentInstance.root}`);

        currentInstance = currentInstance.$getChildInstance(currentPathPiece);
      }
    });
    return result;
  }
}
