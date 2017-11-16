import _ from 'lodash';


export default class TypeManager {
  constructor(main) {
    this._main = main;
    this._registeredTypes = {};
  }

  isRegistered(typeName) {
    return !!this._registeredTypes[typeName];
  }

  getTypeClass(typeName) {
    return this._registeredTypes[typeName];
  }

  register(typeName, typeClass) {
    this._registeredTypes[typeName] = typeClass;
  }

  getInstance(typeName) {
    return new this._registeredTypes[typeName](this._main);
  }

  validateType(typeName, schema, schemaPath) {
    if (!this._registeredTypes[typeName]) return;

    if (this._registeredTypes[typeName].validateSchema) {
      const result = this._registeredTypes[typeName].validateSchema(schema, schemaPath);
      if (_.isString(result)) {
        this._main.$$log.fatal(result);
      }
    }
  }

}
