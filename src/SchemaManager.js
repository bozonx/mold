import _ from 'lodash';

import PagedCollection from './types/PagedCollection';
import Collection from './types/Collection';
import Container from './types/Container';
import Document from './types/Document';
import DocumentsCollection from './types/DocumentsCollection';
import { convertFromLodashToSchema, convertFromSchemaToLodash, getTheBestMatchPath } from './helpers';
import Memory from './drivers/Memory';
import { eachSchema, concatPath, splitPath } from './helpers';

const registeredTypes = {
  pagedCollection: PagedCollection,
  collection: Collection,
  container: Container,
  document: Document,
  documentsCollection: DocumentsCollection,
};

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

    const memoryDriver = new Memory({
      db: this.$defaultMemoryDb,
    });
    this.mainMemoryDriver = memoryDriver.instance({});

    this._checkSchema(this._schema);
  }

  /**
   * get schema part by path
   * @param {string} path - absolute path in lodash format
   * @returns {object} schema like {type, driver, params, schema}
   */
  get(path) {
    if (path === '') return this.getFullSchema();

    const schemaPath = convertFromLodashToSchema(path);
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
   * Get instance of type
   * @param {string} path - absolute path or relative if context is used
   * @param {object} context - instance of root element
   * @returns {object|undefined} - instance of type
   */
  getInstance(path, context=undefined) {
    if (!_.isString(path)) this._main.$$log.fatal(`You must pass a path argument.`);
    if (!path && !context) this._main.$$log.fatal(`Path is empty.`);

    let rootInstance;
    let pathParts;
    let fullMoldPath;
    if (context) {
      fullMoldPath = concatPath(context.root, path);
      pathParts = splitPath(fullMoldPath);
      rootInstance = context;
    }
    else {
      fullMoldPath = path;
      pathParts = splitPath(fullMoldPath);
      rootInstance = this.$getInstanceByFullPath(pathParts[0]);
    }

    if (pathParts.length === 1) {
      return rootInstance;
    }

    const result = this._findInstance(pathParts.slice(1), rootInstance);

    if (result) return result;

    this._main.$$log.fatal(`Can't find a element on path "${fullMoldPath}".`);
  }

  /**
   * It just returns an instance
   * @param fullPath
   */
  $getInstanceByFullPath(fullPath) {
    // It rise an error if path doesn't consist with schema
    const schema = this.get(fullPath);
    const instance = new registeredTypes[schema.type](this._main);

    // It's need for creating collection child
    instance.$init(fullPath);

    return instance;
  }

  /**
   * Get type instance
   * @param {string} path - absolute path or relative if context is used
   * @returns {object} - instance of type
   */
  getInstanceOld(path) {
    let instance;
    // It rise an error if path doesn't consist with schema
    const schema = this.get(path);

    if (schema.type == 'container')                 instance = new Container(this._main);
    else if (schema.type == 'collection')           instance = new Collection(this._main);
    else if (schema.type == 'pagedCollection')      instance = new PagedCollection(this._main);
    else if (schema.type == 'document')             instance = new Document(this._main);
    else if (schema.type == 'documentsCollection')  instance = new DocumentsCollection(this._main);
    else if (schema.type == 'array') {
      this._main.$$log.fatal(`You can't get instance of primitive array!`);
    }
    else if (schema.type == 'boolean' || schema.type == 'string' || schema.type == 'number'){
      this._main.$$log.fatal(`You can't get instance of primitive!`);
    }
    else {
      this._main.$$log.fatal(`No one type have found!`);
    }

    // It's need for creating collection child
    instance.$init(path);

    return instance;
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

  _findInstance(pathParts, rootInstance) {
    let instance = rootInstance;
    let result = null;
    //let currentPathPart = '';

    // получаем первый инстанс корня
    // далее у него спрашиваем в цикле потомка
    // у следующего потомка спрашиваем его потомка
    // последний потомок и будет результатом
    // если результата нет - ошибка


    // TODO: refactor - use reduce
    // iterate each path part


    _.each(pathParts, (pathPart, index) => {
      // combined path to current iteration
      //currentPathPart = concatPath(currentPathPart, pathPart);
      // save instance
      //instances[index] = this.$getInstanceByFullPath(currentPathPart);

      console.log(2222222222, pathPart)

      // TODO: нужно давать всю оставнуюся часть пути

      const child = instance.$getChildInstance(pathPart);

      console.log(3333333, child.root)


      if (index === pathParts.length - 1) {
        // the last path part
        result = child;
      }

      if (!instance.$getChildInstance) {
        // TODO: !!!!! ошибка если не достигнут конец массмва путей
        return;
      }

      instance = child;
    });

    console.log(111111112, result && result.root, result && result.type)
    return result;
  }

  _checkSchema(rawSchema) {
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
