import _ from 'lodash';


export default class BooleanType {
  constructor() {

  }

  validate(value) {
    return _.isBoolean(value);
  }

}
