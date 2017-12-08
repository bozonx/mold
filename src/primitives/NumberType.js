import _ from 'lodash';


export default class NumberType {
  constructor() {

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

  cast(rawValue) {
    // there is not reason to cast
    if (_.isNumber(rawValue)) return rawValue;
    // don't cast undefined or null
    if (_.isUndefined(rawValue) || _.isNull(rawValue)) return rawValue;
    // don't cast NaN
    if (_.isNaN(rawValue)) return rawValue;

    // cast as a number
    const toNumber = _.toNumber(rawValue);

    // TODO: как потом валидировать?????
    if (_.isNaN(toNumber)) return undefined;

    return toNumber;
  }

}
