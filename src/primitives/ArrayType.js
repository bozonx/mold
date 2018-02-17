import _ from 'lodash';

import { validateParams } from '../helpers/helpers';


export default class ArrayType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return [];
  }

  /**
   * Validate schema of array.
   * * initial - it can be like [ 1, 2, 3 ] or [ [1], [2] ]
   * * item - type or schema of item it can be: string, boolean, number or schema like { type: 'array', ...}
   * @param {object} schema - schema of this type
   * @return {string|boolean} - error string or true if valid.
   */
  validateSchema(schema) {
    const allowedTypes = [ 'string', 'number', 'boolean' ];

    return validateParams(_.omit(schema, 'type'), (value, name) => {
      if (name === 'initial') {
        if (!_.isArray(value)) return `Invalid initial value`;

        return true;
      }
      if (name === 'item') {
        if (_.isPlainObject(value)) {
          return this._validateNestedSchema(schema.initial, value);
        }
        else if (!_.includes(allowedTypes, value)) {
          return `Invalid "item" value "${value}"`;
        }

        return this._validateSimpleInitialItems(schema.initial, value);
      }

    });
  }

  /**
   * Validate previously casted data.
   * Rules:
   * * undefined and null are allowed
   * * item of array have to be valid.
   * @param {object} schema - schema of this type
   * @param {array} data - data to validate
   * @return {boolean} - valid state
   */
  validate(schema, data) {
    if (!_.isArray(data) && !_.isNil(data)) return false;

    // TODO: type может быть не только строкой
    const primitiveSchema = { type: schema.item };
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
   * It doesn't cast other types.
   * @param {object} schema - schema of this type
   * @param {array} rawData - raw value
   * @return {array} - correct values
   */
  cast(schema, rawData) {
    // don't cast other types
    if (!_.isArray(rawData)) return rawData;

    const castedData = [];
    const primitiveSchema = { type: schema.item };

    _.each(rawData, (item, index) => {
      castedData[index] = this._typeManager.castValue(primitiveSchema, item);
      // TODO: а валидация разве не нужна???

    });

    return castedData;
  }

  _validateSimpleInitialItems(initial, itemsType) {
    // check each initial item
    if (!initial) return true;

    const badItem = _.find(initial, (val) => {
      return !_[`is${_.capitalize(itemsType)}`](val);
    });

    if (!_.isUndefined(badItem)) return `Bad type of array's item ${JSON.stringify(badItem)}`;

    return true;
  }

  _validateNestedSchema(arrayInitial, nestedSchema) {
    if (!nestedSchema.type) return `Invalid "item" params. Nested schema doesn't have a type param`;
    if (!_.includes([ 'array', 'assoc' ], nestedSchema.type)) return `Invalid type of nested schema: "${nestedSchema.type}"`;

    let errMsg;
    _.find(arrayInitial, (val) => {

      const subSchemaCheck = this._typeManager.validateSchema({
        ...nestedSchema,
        initial: val,
      });

      if (_.isString(subSchemaCheck)) {
        errMsg = subSchemaCheck;

        return true;
      }
    });


    return errMsg || true;
  }

}
