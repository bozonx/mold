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

  /**
   * Cast items of array.
   * @param {object} schema - schema of this type
   * @param {array} rawData - raw value
   * @return {array} - correct values
   */
  cast(schema, rawData) {
    // TODO: is it need to support of udefined and null?
    if (!_.isArray(rawData)) return rawData;

    const castedData = [];
    const primitiveSchema = { type: schema.itemsType };

    _.each(rawData, (item, index) => {
      castedData[index] = this._typeManager.castValue(primitiveSchema, item);
      // TODO: а валидация разве не нужна???

    });

    return castedData;
  }

}
