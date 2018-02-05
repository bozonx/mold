import _ from 'lodash';


export default class AssocType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return {};
  }

  validate(schema, data) {
    if (!_.isPlainObject(data)) return false;

    let isValid = true;

    _.find(data, (rawValue, name) => {
      const primitiveSchema = schema.items[name];
      // do nothing if there isn't schema definition for this param

      if (!primitiveSchema || !primitiveSchema.type) return;

      const result = this._typeManager.validateValue(primitiveSchema, rawValue);

      if (!result) {
        isValid = false;
        
        return true;
      }
    });

    return isValid;
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(schema, data) {
    // do nothing if there isn't schema for assoc
    if (!schema.items) return;

    const castedData = {};

    _.each(data, (rawValue, name) => {
      const primitiveSchema = schema.items[name];
      // do nothing if there isn't schema definition for this param

      if (!primitiveSchema || !primitiveSchema.type) return;

      castedData[name] = this._typeManager.castValue(primitiveSchema, rawValue);
    });

    return castedData;
  }

}
