import _ from 'lodash';

import { isCollection } from '../helpers/helpers';


export default class CollectionType {
  constructor() {

  }

  getInitial() {
    return [];
  }

  validate(value) {
    return isCollection(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(rawValue) {
    // don't cast
    return rawValue;
  }

}
