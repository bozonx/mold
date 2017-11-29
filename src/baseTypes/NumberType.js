import _ from 'lodash';


export default class NumberType {
  constructor() {

  }

  validate(value) {
    return _.isNumber(value);
  }

}
