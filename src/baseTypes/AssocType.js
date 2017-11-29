import _ from 'lodash';


export default class CollectionType {
  constructor() {

  }

  getInitial() {
    return {};
  }

  validate(value) {
    return _.isPlainObject(value);
  }

}
