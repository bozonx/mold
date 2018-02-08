import _ from 'lodash';


export default class BooleanType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return undefined;
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  validate(schema, value) {
    // undefined and null are allowed
    if (_.isNil(value)) return true;

    return _.isBoolean(value);
  }

  /**
   * Cast number, string and stringed 'true' and 'false' to boolean.
   *   * boolean, null and undefined as is.
   *   * other types won't be casted.
   * @param {object} schema - schema of this type
   * @param {*} rawValue - raw value
   * @return {boolean|undefined|null} - correct value
   */
  cast(schema, rawValue) {
    // there is not reason to cast
    if (_.isBoolean(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isNil(rawValue)) return rawValue;

    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;

    // cast number or string as a boolean
    return Boolean(rawValue);
  }

}
