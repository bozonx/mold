import _ from 'lodash';


export default class StringType {
  constructor() {

  }

  getInitial() {
    return undefined;
  }

  validate(value) {
    return _.isString(value);
  }

}
