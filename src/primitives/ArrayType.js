import _ from 'lodash';

import { isSimpleArray } from '../helpers';


export default class ArrayType {
  constructor() {

  }

  getInitial() {
    return [];
  }

  validate(value) {
    return isSimpleArray(value);
  }

}
