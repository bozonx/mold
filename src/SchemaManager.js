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
   * @param {string} schemaPath - if it '' it means set to root
   * @param {object} schema
   */
  setSchema(schemaPath, schema) {
    // TODO: передавать moldPath

    const fullSchema = convertShortSchemaToFull(schema, this._main.$$log);

    if (!schemaPath) {
      this._schema = fullSchema;
    }
    else {
      _.set(this._schema, schemaPath, fullSchema);
    }

    // TODO: сделать сбор драйверов
    // TODO: убрать код который работал с короткими контейнерами

    this._checkWholeSchema();
  }

  _checkWholeSchema() {
    // TODO: вернуть
    return;

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
