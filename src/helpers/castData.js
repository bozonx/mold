import _ from 'lodash';


/**
 * Cast data if it needs.
 */
class Cast {
  constructor(moldPath, schema, data, castPrimitive) {
    this._moldPath = moldPath;
    this._schema = schema;
    this._data = data;
    this._castPrimitive = castPrimitive;
  }

  cast() {
    if (!_.isPlainObject(this._data)) return this._data;

    let result = {};

    _.each(this._data, (item, name) => {
      result[name] = this._crossroads(name, item);
    });

    return result;
  }

  _crossroads(localMoldPath, value) {
    if (_.isPlainObject(value)) {
      // TODO: go deeper
    }
    else if (_.isArray(value)) {
      // TODO: cast each
      // TODO: cast collections
    }
    //else if ()
    else {
      return value;
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


export default function(moldPath, schema, data, castPrimitive) {
  const cast = new Cast(moldPath, schema, data, castPrimitive);

  return cast.cast();
};
