import _ from 'lodash';


/**
 * Validate data for corresponding to schema.
 * It doesn't validate additional or redundant items in schema.
 */
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

    _.find(this._data, (item, name) => {
      const validated = this._crossroads(name, name, item);
      // look for only for error, valid values are skipped
      if (_.isPlainObject(validated)) {
        result = validated;

        return true;
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
      return this._checkPrimitive(localMoldPath, localSchema, value);
    }
  }

  _checkPrimitive(localMoldPath, localSchema, value) {
    const correctValue = this._castPrimitive(localSchema, value);
    const isValid = this._validatePrimitive(localSchema, correctValue);

    if (!isValid) {
      return {
        error: `Invalid value "${JSON.stringify(value)}" on "${this._moldPath}.${localMoldPath}"`,
        correctValue,
      }
    }
  }

}


export default function(moldPath, schema, data, castPrimitive, validatePrimitive) {
  const validate = new Validate(moldPath, schema, data, castPrimitive, validatePrimitive);

  return validate.validate();
};
