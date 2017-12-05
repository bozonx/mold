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

}
