const _ = require('lodash');


module.exports = class NodeManager {
  constructor(main) {
    this._main = main;
    this._registeredTypes = {};
  }

  isRegistered(typeName) {
    return Boolean(this._registeredTypes[typeName]);
  }

  register(typeName, typeClass) {
    this._registeredTypes[typeName] = typeClass;
  }

  /**
   * Get instance of type
   * @param {string} moldPath - absolute path
   * @param {...array} params - params to instance
   * @returns {object|undefined} - instance of type
   */
  getInstance(moldPath, ...params) {
    if (!moldPath || !_.isString(moldPath)) {
      this._main.log.fatal(`Bad "moldPath" param: ${JSON.stringify(moldPath)}`);
    }

    const schema = this._main.schemaManager.getSchema(moldPath);

    if (_.isUndefined(schema)) {
      this._main.log.fatal(`Schema on path "${moldPath}" doesn't exists`);
    }

    return this._newInstance(moldPath, schema, params);
  }

  validateSchema(typeName, schema, schemaPath) {
    if (!this._registeredTypes[typeName]) return `Unregistered type "${typeName}"`;

    if (!this._registeredTypes[typeName].validateSchema) {
      return `Can't find "validateSchema" class prop on "${schemaPath}"`;
    }

    return this._registeredTypes[typeName].validateSchema(schema, schemaPath);
  }

  _newInstance(moldPath, schema, params) {
    const instance = new this._registeredTypes[schema.type](this._main);

    instance.$init(moldPath, schema, ...params);

    return instance;
  }

};
