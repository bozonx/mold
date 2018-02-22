import _ from 'lodash';

import { validateParams } from '../helpers/helpers';


export default class AssocType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return {};
  }

  validateSchema(schema) {
    return validateParams(_.omit(schema, 'type'), (value, name) => {
      if (name === 'initial') {
        if (!_.isPlainObject(value)) return `Invalid initial value`;

        return true;
      }
      else if (name === 'items') {
        if (!_.isPlainObject(value)) {
          return `Invalid type of "items" param`;
        }

        if (_.isEmpty(value)) {
          return `Items are empty`;
        }

        let errMsg;

        _.find(value, (subSchema, subName) => {
          let preparedSubSchema = subSchema;
          if (schema.initial) {
            preparedSubSchema = {
              ...subSchema,
              initial: schema.initial && schema.initial[subName],
            };
          }

          const result = this._typeManager.validateSchema(preparedSubSchema);

          if (_.isString(result)) {
            errMsg = `Param "${subName}": ${result}`;

            return true;
          }
        });

        return errMsg || true;
      }
    });
  }

  validate(schema, data) {
    if (!_.isPlainObject(data) && !_.isNil(data)) return `Bad type`;

    let invalidMsg;

    _.find(data, (rawValue, name) => {
      const primitiveSchema = schema.items[name];
      // do nothing if there isn't schema definition for this param
      if (!primitiveSchema || !primitiveSchema.type) return;

      const result = this._typeManager.validateValue(primitiveSchema, rawValue);

      if (result) {
        invalidMsg = result;

        return true;
      }
    });

    return invalidMsg;
  }

  /**
   * Cast items of assoc.
   * @param {object} schema - schema of this type
   * @param {object} rawData - raw assoc
   * @return {{}} - correct values
   */
  cast(schema, rawData) {
    // don't cast other types
    if (!_.isPlainObject(rawData)) return rawData;

    // do nothing if there isn't schema for assoc
    if (!schema.items) return rawData;

    const castedData = {};

    _.each(rawData, (rawValue, name) => {
      const primitiveSchema = schema.items[name];
      // don't cast if there isn't schema definition for this param
      if (!primitiveSchema || !primitiveSchema.type) {
        castedData[name] = rawValue;

        return;
      }

      // cast
      castedData[name] = this._typeManager.castValue(primitiveSchema, rawValue);
    });

    return castedData;
  }

}
