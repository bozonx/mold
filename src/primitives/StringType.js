import _ from 'lodash';

import { validateParams } from '../helpers/helpers';


export default class StringType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return undefined;
  }

  validateSchema(schema) {
    return validateParams(_.omit(schema, 'type'), (value, name) => {
      if (name === 'initial') {
        if (!_.isString(value)) return `Invalid initial value`;

        return true;
      }

    });
  }

  validate(schema, value) {
    // undefined and null are allowed
    if (_.isNil(value)) return true;

    return _.isString(value);
  }

  /**
   * Cast number to string. Other types cast like this:
   *   * Boolean and NaN = undefined
   *   * string, null and undefined as is.
   *   * other types won't be casted.
   * @param {object} schema - schema of this type
   * @param {*} rawValue - raw value
   * @return {string|undefined|null} - correct value
   */
  cast(schema, rawValue) {
    // there isn't reason to cast
    if (_.isString(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isNil(rawValue)) return rawValue;

    // boolean or NaN cast to undefined
    if (_.isBoolean(rawValue) || _.isNaN(rawValue)) return undefined;

    // if it isn't a number e.g. array or object - do nothing
    if (!_.isNumber(rawValue)) return rawValue;

    // cast number to string
    return _.toString(rawValue);
  }

}
