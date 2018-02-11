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
      if (name === 'items') {
        if (!_.isPlainObject(value)) {
          return `Invalid type of "items" param`;
        }

        if (_.isEmpty(value)) {
          return `Items are empty`;
        }

        let errMsg;

        _.find(value, (subSchema, subName) => {
          const result = this._typeManager.validateSchema(subSchema);
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
    // TODO: nil is allows

    if (!_.isPlainObject(data)) return false;

    let isValid = true;

    _.find(data, (rawValue, name) => {
      const primitiveSchema = schema.items[name];
      // do nothing if there isn't schema definition for this param

      if (!primitiveSchema || !primitiveSchema.type) return;

      const result = this._typeManager.validateValue(primitiveSchema, rawValue);

      if (!result) {
        isValid = false;

        return true;
      }
    });

    return isValid;
  }

  /**
   * Cast items of assoc.
   * @param {object} schema - schema of this type
   * @param {object} rawData - raw assoc
   * @return {{}} - correct values
   */
  cast(schema, rawData) {
    // TODO: is it need to support of udefined and null?
    if (!_.isPlainObject(rawData)) return rawData;

    // do nothing if there isn't schema for assoc
    // TODO: is it need to return {} of undefined?
    if (!schema.items) return;

    const castedData = {};

    _.each(rawData, (rawValue, name) => {
      const primitiveSchema = schema.items[name];
      // do nothing if there isn't schema definition for this param
      // TODO: наверное оставить значение как есть чтобы потом валидировать
      if (!primitiveSchema || !primitiveSchema.type) return;

      castedData[name] = this._typeManager.castValue(primitiveSchema, rawValue);
      // TODO: а валидация разве не нужна???
    });

    return castedData;
  }

}
