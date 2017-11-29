import _ from 'lodash';

import ArrayType from './baseTypes/ArrayType';
import AssocType from './baseTypes/AssocType';
import BooleanType from './baseTypes/BooleanType';
import NumberType from './baseTypes/NumberType';
import StringType from './baseTypes/StringType';


export default class TypeManager {
  constructor(main) {
    this._main = main;
    this.types = {
      array: new ArrayType(),
      assoc: new AssocType(),
      boolean: new BooleanType(),
      number: new NumberType(),
      string: new StringType(),
    }
  }

}
