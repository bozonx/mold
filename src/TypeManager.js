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

  _newInstance(typeName) {
    return new this._registeredTypes[typeName](this._main);
  }

  /**
   * It just returns an instance
   * @param {{mold: string, schema: string, storage: string}} paths
   */
  $getInstanceByFullPath(paths) {
    // It rise an error if path doesn't consist with schema
    const schema = this._main.$$schemaManager.getSchema(paths.schema);
    const instance = this._newInstance(schema.type);
    instance.$init(paths, schema);

    return instance;
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
