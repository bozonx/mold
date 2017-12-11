import _ from 'lodash';


export default class BooleanType {
  constructor() {

  }

  getInitial() {
    return undefined;
  }

  validate(value) {
    return _.isBoolean(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(schema, rawValue) {
    // there is not reason to cast
    if (_.isBoolean(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isUndefined(rawValue) || _.isNull(rawValue)) return rawValue;
    // don't cast other types of number or string
    if (!_.isNumber(rawValue) && !_.isString(rawValue)) return rawValue;

    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;

    // cast number or string as a boolean
    return Boolean(rawValue);
  }

}
