import _ from 'lodash';


export default class NumberType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return undefined;
  }

  validate(schema, value) {
    // undefined and null are allowed
    if (_.isNil(value)) return true;

    return _.isNumber(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  /**
   * Cast string and boolean to number. Other types cast like this:
   *   * number, NaN, null and undefined as is.
   *   * other types won't be casted.
   * @param {object} schema - schema of this type
   * @param {*} rawValue - raw value
   * @return {number|undefined|null} - correct value
   */
  cast(schema, rawValue) {
    // there is not reason to cast
    if (_.isNumber(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isNil(rawValue)) return rawValue;
    // don't cast NaN
    if (_.isNaN(rawValue)) return rawValue;

    // cast string and boolean as a number
    const toNumber = _.toNumber(rawValue);

    // don't cast invalid value
    if (_.isNaN(toNumber)) return rawValue;

    return toNumber;
  }

}
