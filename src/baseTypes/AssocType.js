import _ from 'lodash';


export default class CollectionType {
  constructor() {

  }

  validate(value) {
    return _.isPlainObject(value);
  }

}
