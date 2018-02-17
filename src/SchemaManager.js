import _ from 'lodash';

import convertShortSchemaToFull from './helpers/convertShortSchemaToFull';
import { eachSchema, convertFromLodashToSchema } from './helpers/helpers';


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
  }

  /**
   * Get full schema
   * @returns {object} schema
   */
  getFullSchema() {
    return this._schema;
  }

  /**
   * Get schema part by path.
   * @param {string} moldPath - absolute mold path
   * @returns {object|undefined} schema part on path or undefined if schema hasn't found
   */
  getSchema(moldPath) {
    if (!moldPath || !_.isString(moldPath)) {
      this._main.$$log.fatal(`Bad "moldPath" param: ${JSON.stringify(moldPath)}`);
    }

    const schemaPath = convertFromLodashToSchema(moldPath);

    return this._justGetSchema(schemaPath);
  }

  /**
   * Set schema node to certain mount point.
   * @param {string} moldPath - absolute mold path.
   * @param {object} schema - your schema
   */
  setNode(moldPath, schema) {
    if (!moldPath || !_.isString(moldPath)) {
      this._main.$$log.fatal(`Bad "moldPath" param: ${JSON.stringify(moldPath)}`);
    }

    const schemaPath = convertFromLodashToSchema(moldPath);
    const fullSchema = convertShortSchemaToFull(schema, this._main.$$log);

    _.set(this._schema, schemaPath, fullSchema);

    this._checkWholeSchema();
    // collect driver from whole schema, but don't reinit they if they were inited.
    this._main.driverManager.collectDrivers(this._schema);
  }

  /**
   * Set schema to root.
   * @param {object} schema - your schema.
   */
  setSchema(schema) {
    this._schema = convertShortSchemaToFull(schema, this._main.$$log);

    this._checkWholeSchema();
    // collect driver from whole schema, but don't reinit they if they were inited.
    this._main.driverManager.collectDrivers(this._schema);
  }

  _checkWholeSchema() {
    eachSchema(this._schema, (moldPath, schemaPath, schema) => {
      // check node
      if ( this._main.$$nodeManager.isRegistered(schema.type) ) {
        const result = this._main.$$nodeManager.validateSchema(schema.type, schema, schemaPath);
        if (_.isString(result)) this._main.$$log.fatal(result);
      }
      // check primitive
      else if (this._main.$$typeManager.isRegistered(schema.type)) {
        const result = this._main.$$typeManager.validateSchema(schema);
        if (_.isString(result)) this._main.$$log.fatal(result);
      }
      else {
        this._main.$$log.fatal(`Unknown schema node or primitive ${JSON.stringify(schema)} !`);
      }
    });
  }

  _justGetSchema(schemaPath) {
    return _.get(this._schema, schemaPath);
  }

}
