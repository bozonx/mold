import _ from 'lodash';

import { validateParams } from '../helpers/helpers';


export default class NumberType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return undefined;
  }

  validateSchema(schema) {
    return validateParams(_.omit(schema, 'type'), (value, name) => {
      if (name === 'initial') {
        if (!_.isNumber(value)) return `Invalid initial value`;

        return true;
      }
      else if (name === 'primary') {
        if (!_.isBoolean(value)) return `Invalid primary param`;

        return true;
      }

    });
  }

  validate(schema, value) {
    if (!_.isNumber(value) && !_.isNil(value) && !_.isNaN(value)) return `Bad type`;
  }

  /**
   * Cast string and boolean to number. Other types cast like this:
   *   * number, NaN, null and undefined as is.
   *   * other types won't be casted.
   * @param {object} schema - schema of this type
   * @param {*} rawValue - raw value
   * @return {number|NaN|undefined|null} - correct value
   */
  cast(schema, rawValue) {
    // there is not reason to cast
    if (_.isNumber(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isNil(rawValue)) return rawValue;
    // don't cast NaN
    if (_.isNaN(rawValue)) return rawValue;

    // don't cast other values e.g. array or object
    if (!_.isBoolean(rawValue) && !_.isString(rawValue)) {
      return rawValue;
    }

    // cast string and boolean as a number
    const toNumber = _.toNumber(rawValue);

    // don't cast invalid value like '5a'
    if (_.isNaN(toNumber)) return rawValue;

    return toNumber;
  }

}
