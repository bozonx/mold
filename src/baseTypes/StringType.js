import _ from 'lodash';


export default class StringType {
  constructor() {

  }

  validate(value) {
    return _.isString(value);
  }

}
