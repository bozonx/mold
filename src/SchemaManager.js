import _ from 'lodash';

import { convertFromLodashToSchema, convertFromSchemaToLodash, getTheBestMatchPath } from './helpers';
import Memory from './drivers/Memory';
import { eachSchema, concatPath, splitPath } from './helpers';

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
    //let fullMoldPath;

    if (context) {
      // use received context
      if (!path) return context;

      //fullMoldPath = concatPath(context.root, path);
      childPathParts = splitPath(path);
      rootInstance = context;
    }
    else {
      // use instance of first level of path

      //fullMoldPath = path;
      const pathParts = splitPath(path);
      childPathParts = pathParts.slice(1);
      rootInstance = this.$getInstanceByFullPath({
        mold: pathParts[0],
        schema: convertFromLodashToSchema(pathParts[0]),
        storage: pathParts[0],
      });

      // if there is only first level of path - return its instance.
      if (childPathParts.length === 0) return rootInstance;
    }

    return this._findInstance(childPathParts, rootInstance);

    // const result = this._findInstance(childPathParts, rootInstance);
    // if (result) return result;
    // this._main.$$log.fatal(`Can't find a element on path "${fullMoldPath}".`);
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
        if (!currentInstance.$getChildInstance)
          this._main.$$log.fatal(`There is no method "$getChildInstance" of ${currentInstance.root}`);

        currentInstance = currentInstance.$getChildInstance(currentPathPiece);
      }
    });
    return result;
  }

  checkSchema() {
    // TODO: запускать метод у каждого типа
    // Validate schema
    eachSchema(this._schema, (schemaPath, schema) => {
      if (_.includes(
          ['documentsCollection', 'document', 'container', 'collection'], schema.type)
          && schema.driver) {
        schema.driver.init(convertFromSchemaToLodash(schemaPath), this._main);
        this._drivers[schemaPath] = schema.driver;
      }

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
}
