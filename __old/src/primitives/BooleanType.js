const _ = require('lodash');
const { validateParams } = require('../helpers/helpers');


module.exports = class BooleanType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return undefined;
  }

  validateSchema(schema) {
    return validateParams(_.omit(schema, 'type'), (value, name) => {
      if (name === 'initial') {
        if (!_.isBoolean(value)) return `Invalid initial value`;

        return true;
      }

    });
  }

  /**
   * Validate previously casted data. Undefined and null are allowed
   * @param {object} schema - schema of this type
   * @param {array} value - value to validate
   * @return {string|undefined} - It returns error message of undefined if there wasn't an error.
   */
  validate(schema, value) {
    if (!_.isBoolean(value) && !_.isNil(value)) return `Bad type`;
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

    // don't cast other values e.g. array or object
    if (!_.isNumber(rawValue) && !_.isString(rawValue)) {
      return rawValue;
    }

    // cast number or string as a boolean
    return Boolean(rawValue);
  }

};
