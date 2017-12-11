import _ from 'lodash';


export default class NumberType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return undefined;
  }

  validate(value) {
    return _.isNumber(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(schema, rawValue) {
    // there is not reason to cast
    if (_.isNumber(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isNil(rawValue)) return rawValue;
    // don't cast NaN
    if (_.isNaN(rawValue)) return rawValue;

    // cast string as a number
    const toNumber = _.toNumber(rawValue);

    // don't cast invalid value
    if (_.isNaN(toNumber)) return rawValue;

    return toNumber;
  }

}
