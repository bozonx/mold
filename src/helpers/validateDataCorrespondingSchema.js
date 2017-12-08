import _ from 'lodash';


class Validate {
  constructor(moldPath, schema, data, castPrimitive, validatePrimitive) {
    this._moldPath = moldPath;
    this._schema = schema;
    this._data = data;
    this._castPrimitive = castPrimitive;
    this._validatePrimitive = validatePrimitive;
  }

  validate() {
    if (!_.isPlainObject(this._data)) {
      return {
        error: `Incorrect data value "${JSON.stringify(this._data)}"`,
      }
    }

    let result = true;

    _.each(this._data, (item, name) => {
      const returns = this._crossroads(name, name, item);
      if (returns) {
        result = returns;
      }
    });

    return result;
  }

  _crossroads(localMoldPath, localSchemaPath, value) {
    const localSchema = _.get(this._schema, localSchemaPath);

    // don't check odd values
    if (!localSchema) return;

    if (localSchema.type === 'assoc') {
      // TODO: !!!
    }
    else if (localSchema.type === 'collection') {
      // TODO: !!!
    }
    else {
      return this._checkPrimitive(localMoldPath, localSchemaPath, localSchema, value);
    }
  }

  _checkPrimitive(localMoldPath, localSchemaPath, localSchema, value) {
    const castedValue = this._castPrimitive(localSchema, value);

    const isValid = this._validatePrimitive(localSchema, castedValue);
  }

}



export default function(moldPath, schema, data) {
  const validate = new Validate(moldPath, schema, data);

  return validate.validate();

  // TODO: do it. return string on error
  // TODO: могут быть лишние элементы, могут бытьне полные данные
};
