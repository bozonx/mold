import _ from 'lodash';

import { isSimpleArray } from '../helpers/helpers';


export default class ArrayType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return [];
  }

  validate(schema, data) {
    if (!isSimpleArray(data)) return false;

    const primitiveSchema = { type: schema.itemsType };
    let isValid = true;

    _.find(data, (rawValue) => {
      const result = this._typeManager.validateValue(primitiveSchema, rawValue);

      if (!result) {
        isValid = false;
        return true;
      }
    });

    return isValid;
  }

  validateSchema(schema) {
    // TODO: do it
    // TODO: itemsType
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
