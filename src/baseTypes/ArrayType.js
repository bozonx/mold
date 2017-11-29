import _ from 'lodash';

import { isSimpleArray } from '../helpers';


export default class ArrayType {
  constructor() {

  }

  validate(value) {
    return isSimpleArray(value);
  }

}
