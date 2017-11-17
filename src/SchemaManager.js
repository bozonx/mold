import _ from 'lodash';

import { convertFromLodashToSchema, convertFromSchemaToLodash } from './helpers';
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
    this._schema = null;
  }

  init() {
    this._schema = {};
    this._main.$$driverManager.initDefaultDriver();
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
   * Get instance of type
   * @param {string} path - absolute path or relative if context is used
   * @param {object} context - instance of root element
   * @returns {object|undefined} - instance of type
   */
  getInstance(path, context=undefined) {
    // TODO: может перенести в $$typeManager ?
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
      rootInstance = this._main.$$typeManager.$getInstanceByFullPath({
        // TODO: use moldPath, schemaPath, storagePath
        mold: pathParts[0],
        schema: convertFromLodashToSchema(pathParts[0]),
        storage: pathParts[0],
      });

      // if there is only first level of path - return its instance.
      if (childPathParts.length === 0) return rootInstance;
    }

    // TODO: throw an Error if instant hasn't found
    return this._findInstance(childPathParts, rootInstance);
  }

  /**
   * Set schema to certain mount point
   * @param {string} moldMountPath - if it '' it means set to root
   * @param {object} schema
   */
  setSchema(moldMountPath, schema) {
    if (!moldMountPath) {
      this._schema = schema;
    }
    else {
      const schemaPath = convertFromLodashToSchema(moldMountPath);
      _.set(this._schema, schemaPath, schema);
    }

    this._checkSchema();
  }

  _checkSchema() {
    eachSchema(this._schema, (schemaPath, schema) => {
      // init driver if it has set
      if (schema.driver) {
        // TODO: почему именно так???
        schema.driver.init(convertFromSchemaToLodash(schemaPath), this._main);
        // this._drivers[schemaPath] = schema.driver;
        this._main.$$driverManager.registerDriver(schemaPath, schema.driver);
      }

      // schema validation
      if ( this._main.$$typeManager.isRegistered(schema.type) ) {
        this._main.$$typeManager.validateType(schema.type, schema, schemaPath);
      }
      else if (!_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
        this._main.$$log.fatal(`Unknown schema node ${JSON.stringify(schema)} !`);
      }
    });
  }

  _findInstance(pathParts, rootInstance) {
    // TODO: вывалить ошибку при попытке получить тип по несуществующему пути

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
