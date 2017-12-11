import _ from 'lodash';

import { isSimpleArray } from '../helpers/helpers';


export default class ArrayType {
  constructor() {

  }

  getInitial() {
    return [];
  }

  validate(value) {
    return isSimpleArray(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(schema, rawValue) {
    // don't cast
    return rawValue;
  }

}
