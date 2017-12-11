import _ from 'lodash';


export default class StringType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return undefined;
  }

  validate(schema, value) {
    // undefined and null are allowed
    if (_.isNil(value)) return true;

    return _.isString(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(schema, rawValue) {
    // there isn't reason to cast
    if (_.isString(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isNil(rawValue)) return rawValue;

    // boolean or NaN casts to undefined
    if (_.isBoolean(rawValue) || _.isNaN(rawValue)) return undefined;
    // cast number to string
    if (!_.isNumber(rawValue)) return rawValue;

    return _.toString(rawValue);
  }

}
