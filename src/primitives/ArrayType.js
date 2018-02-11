import _ from 'lodash';

import { isSimpleArray, validateParams } from '../helpers/helpers';


export default class ArrayType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return [];
  }

  validateSchema(schema) {
    return validateParams(_.omit(schema, 'type'), (value, name) => {
      if (name === 'initial') {
        if (!_.isArray(value)) return `Invalid initial value`;

        return true;
      }
      if (name === 'itemsType') {
        if (!_.includes([ 'string', 'number', 'boolean', 'array', 'collection' ], value)) {
          return `Invalid "itemsType" value "${value}"`;
        }

        // TODO: проверить все значения inital на соответствие itemsType
        // TODO: проверить item - схема для вложенной array и collection

        return true;
      }

    });
  }

  validate(schema, data) {
    // TODO: nil is allows

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
