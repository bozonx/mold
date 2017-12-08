import _ from 'lodash';


export default class StringType {
  constructor() {

  }

  getInitial() {
    return undefined;
  }

  validate(value) {
    return _.isString(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(rawValue) {
    // there is not reason to cast
    if (_.isString(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isUndefined(rawValue) || _.isNull(rawValue)) return rawValue;

    // boolean or NaN casts to undefined
    if (_.isBoolean(rawValue) || _.isNaN(rawValue)) return undefined;
    // cast number to string
    if (!_.isNumber(rawValue)) return rawValue;

    return _.toString(rawValue);
  }

}
