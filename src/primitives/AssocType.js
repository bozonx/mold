import _ from 'lodash';


export default class AssocType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return {};
  }

  validate(value) {
    return _.isPlainObject(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  // cast(rawValue) {
  //   // don't cast
  //   return rawValue;
  // }

  cast(schema, data) {
    // do nothing if there isn't schema for assoc
    if (!schema.items) return;

    const castedData = {};

    _.each(data, (rawValue, name) => {
      const primitiveSchema = schema.items[name];
      // do nothing if there isn't schema definition for this param
      if (!primitiveSchema) return;

      castedData[name] = this._typeManager.castValue(primitiveSchema, rawValue);
    });

    return castedData;
  }

}
