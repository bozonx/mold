// It's schema manager
// You can set schema only once on creating instance
// You can't mutate a schema

import _ from 'lodash';

import ArrayInstance from './types/ArrayInstance';
import CollectionInstance from './types/CollectionInstance';
import ContainerInstance from './types/ContainerInstance';
import PrimitiveInstance from './types/PrimitiveInstance';
import { recursiveSchema } from './helpers';

export default class SchemaManager {
  init(schema, main) {
    this._schema = null;
    this._rawSchema = schema;
    this._main = main;
    this._drivers = {};
    this._documents = {};

    this._initSchema();
  }

  /**
   * get schema part by path
   * @param {string} path - absolute path
   * @returns {object} schema
   */
  get(path) {
    if (path === '') return this.getFullSchema();

    // TODO: do it immutable
    var schema = _.get(this._schema, path);
    if (_.isUndefined(schema)) throw new Error(`Schema on path "${path}" doesn't exists`);

    return schema;
  }

  /**
   * Has a param on path
   * Path = '' means root.
   * @param {string} path - absolute path
   * @returns {boolean}
   */
  has(path) {
    if (path === '') return true;
    return _.has(this._schema, path);
  }

  /**
   * Get full schema
   * @returns {object} schema
   */
  getFullSchema() {
    // TODO: do it immutable
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
      instance = new ContainerInstance(this._main);
    }
    else if (schema.type === 'array') {
      instance = new ArrayInstance(this._main);
    }
    else if (schema.type === 'collection') {
      instance = new CollectionInstance(this._main);
    }
    else {
      instance = new PrimitiveInstance(this._main);
    }

    // TODO: может инициализировать  всё сразу в конструкторе???

    instance.init(path, schema);

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

    return _.find(this._documents, (value, documentPath) => {
      return path.indexOf(documentPath) === 0;
    });
  }

  /**
   * Get driver. If it doesnt exists, returns undefined
   * @param {string} path - absolute path for driver or its child
   * @returns {object|undefined}
   */
  getDriver(path) {
    if (!_.isString(path))
      throw new Error(`You must pass the path argument!`);

    return _.find(this._drivers, (value, driverPath) => {
      return path.indexOf(driverPath) === 0;
    });
  }

  /**
   * Initializing the schema:
   * * Validate schema
   * * extract all drivers from schema to this._drivers and init them
   * * extract all documents from schema to this._documents
   */
  _initSchema() {
    this._schema = {};

    recursiveSchema('', this._rawSchema, (newPath, value, itemName) => {
      if (value.driver) {

        this._drivers[newPath] = value.driver;

        // TODO: local events
        value.driver.init(newPath, this, this._main.state, {});

        if (!_.isObject(value.schema))
          throw new Error(`On a path "${newPath}" driver must has a "schema" param.`);

        _.set(this._schema, newPath, value.schema);
        // Go through inner param 'schema'
        return 'schema';
      }
      else if (_.isObject(value.document)) {
        this._documents[newPath] = {
          ...value.document,
          pathToDocument: newPath,
        };

        if (!_.isObject(value.schema))
          throw new Error(`On a path "${newPath}" document must has a "schema" param.`);

        _.set(this._schema, newPath, value.schema);
        // Go through inner param 'schema'
        return 'schema';
      }
      // else if (value.type == 'array') {
      //   // TODO: do it
      //   // array
      //   _.set(this._schema, newPath, {
      //     type: value.type,
      //   });
      //   // Go deeper
      //   return false;
      // }
      else if (value.type == 'collection') {
        // collection
        // TODO: check it
        if (!_.isObject(value.item))
          throw new Error(`On a path "${newPath}" list must has an "item" param.`);

        _.set(this._schema, newPath, {
          type: value.type,
          item: {},
        });
        // Go deeper
        return 'item';
      }
      else if (value.type) {
        // param
        // TODO: validate it
        _.set(this._schema, newPath, value);
        return false;
      }
      else {
        // container
        _.set(this._schema, newPath, {});
        // Go deeper
        return true;
      }
    });
  }

}

