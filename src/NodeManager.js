import _ from 'lodash';

import { convertFromLodashToSchema } from './helpers/helpers';


export default class NodeManager {
  constructor(main) {
    this._main = main;
    this._registeredTypes = {};
  }

  isRegistered(typeName) {
    return !!this._registeredTypes[typeName];
  }

  register(typeName, typeClass) {
    this._registeredTypes[typeName] = typeClass;
  }

  /**
   * Get instance of type
   * @param {string} moldPath - absolute path
   * @returns {object|undefined} - instance of type
   */
  getInstance(moldPath) {
    if (!_.isString(moldPath)) this._main.$$log.fatal(`You must pass a path argument.`);

    const schemaPath = convertFromLodashToSchema(moldPath);
    const schema = this._main.$$schemaManager.getSchema(schemaPath);

    if (_.isUndefined(schema)) {
      this._main.$$log.fatal(`Schema on path "${moldPath}" doesn't exists`);
    }

    return this._newInstance(moldPath, schema);
  }

  validateType(typeName, schema, schemaPath) {
    if (!this._registeredTypes[typeName]) return;

    if (!this._registeredTypes[typeName].validateSchema) {
      this._main.$$log.fatal(`Can't find "validateSchema" class prop on "${schemaPath}"`);
    }

    const result = this._registeredTypes[typeName].validateSchema(schema, schemaPath);
    if (_.isString(result)) {
      this._main.$$log.fatal(result);
    }
  }

  _newInstance(moldPath, schema) {
    const instance = new this._registeredTypes[schema.type](this._main);
    instance.$init(moldPath, schema);

    return instance;
  }

}
