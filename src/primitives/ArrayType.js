import _ from 'lodash';

import { isSimpleArray } from '../helpers/helpers';


export default class ArrayType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return [];
  }

  validate(schema, value) {
    // TODO: do it
    return isSimpleArray(value);
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(schema, rawValue) {
    const castedData = [];
    const primitiveSchema = { type: schema.itemsType };

    _.each(rawValue, (item, index) => {
      castedData[index] = this._typeManager.castValue(primitiveSchema, item);
    });

    return castedData;
  }

}
