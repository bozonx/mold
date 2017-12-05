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

}
