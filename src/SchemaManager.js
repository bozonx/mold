import _ from 'lodash';

import { eachSchema, convertFromLodashToSchema, convertFromSchemaToLodash } from './helpers';


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
   * @returns {object|undefined} schema part on path or undefined if schema hasn't found
   */
  getSchema(schemaPath) {
    if (schemaPath === '') return this.getFullSchema();

    // TODO: проверить как будет работать с новыми контейнерами

    return _.get(this._schema, schemaPath);
  }

  /**
   * Set schema to certain mount point
   * @param {string} moldMountPath - if it '' it means set to root
   * @param {object} schema
   */
  setSchema(moldMountPath, schema) {

    // TODO: проверить как будет работать с новыми контейнерами

    if (!moldMountPath) {
      this._schema = schema;
    }
    else {
      const schemaPath = convertFromLodashToSchema(moldMountPath);
      _.set(this._schema, schemaPath, schema);
    }

    // TODO: вернуть
    //this._checkSchema();
  }

  _checkSchema() {

    // TODO: проверить как будет работать с новыми контейнерами

    eachSchema(this._schema, (schemaPath, schema) => {
      // init driver if it has set
      if (schema.driver) {
        // TODO: почему именно так???
        // TODO: не должно быть convertFromSchemaToLodash
        schema.driver.init(convertFromSchemaToLodash(schemaPath), this._main);
        // this._drivers[schemaPath] = schema.driver;
        this._main.$$driverManager.registerDriver(schemaPath, schema.driver);
      }

      // schema validation
      if ( this._main.$$nodeManager.isRegistered(schema.type) ) {
        this._main.$$nodeManager.validateType(schema.type, schema, schemaPath);
      }
      else if (!_.includes(['boolean', 'string', 'number', 'array'], schema.type)) {
        this._main.$$log.fatal(`Unknown schema node ${JSON.stringify(schema)} !`);
      }
    });
  }

}
