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

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

}
