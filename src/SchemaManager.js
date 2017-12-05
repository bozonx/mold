import _ from 'lodash';

import convertShortSchemaToFull from './helpers/convertShortSchemaToFull';
import { eachSchema, convertFromLodashToSchema, convertFromSchemaToLodash } from './helpers/helpers';


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
   * @param {string} moldPath - absolute mold path
   * @returns {object|undefined} schema part on path or undefined if schema hasn't found
   */
  getSchema(moldPath) {
    if (!moldPath || !_.isString(moldPath)) {
      this._main.$$log.fatal(`ERROR: bad "moldPath" param: ${JSON.stringify(moldPath)}`);
    }

    const schemaPath = convertFromLodashToSchema(moldPath);

    return _.get(this._schema, schemaPath);
  }

  /**
   * Set schema to certain mount point
   * @param {string} moldPath - absolute mold path. if it '' it means set to root
   * @param {object} schema
   */
  setSchema(moldPath, schema) {
    const schemaPath = convertFromLodashToSchema(moldPath);
    const fullSchema = convertShortSchemaToFull(schema, this._main.$$log);

    if (!schemaPath) {
      this._schema = fullSchema;
    }
    else {
      _.set(this._schema, schemaPath, fullSchema);
    }

    this._checkWholeSchema();
    // collect driver from whole schema, but don't reinit they if they were inited.
    this._main.$$driverManager.collectDrivers(this._schema);
  }

  _checkWholeSchema() {
    eachSchema(this._schema, (schemaPath, schema) => {
      // schema validation
      if ( this._main.$$nodeManager.isRegistered(schema.type) ) {
        this._main.$$nodeManager.validateType(schema.type, schema, schemaPath);
      }
      else if (schema.schema || schema.item) {
        this._main.$$log.fatal(`Unregistered schema node type ${JSON.stringify(schema)} !`);
      }
      // check primitive
      else if (this._main.$$typeManager.isRegistered(schema.type)) {
        this._main.$$typeManager.validateSchema(schema);
      }
      else {
        this._main.$$log.fatal(`Unknown schema node type ${JSON.stringify(schema)} !`);
      }
    });
  }

}
