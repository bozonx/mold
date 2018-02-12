import _ from 'lodash';

import { isSimpleCollection } from '../../src/helpers/helpers';


export default class CollectionType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return [];
  }

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  validate(schema, data) {
    // TODO: nil is allowes
    if (!isSimpleCollection(data)) return false;

    const itemSchema = {
      type: 'assoc',
      items: schema.item,
    };
    let isValid = true;

    _.find(data, (rawValue) => {
      if (_.isNil(rawValue)) {
        return;
      }
      else if (!_.isPlainObject(rawValue)) {
        isValid = false;

        return true;
      }

      const result = this._typeManager.validateValue(itemSchema, rawValue);

      if (!result) {
        isValid = false;

        return true;
      }
    });

    return isValid;
  }

  /**
   * Cast items of collection.
   * @param {object} schema - schema of this type
   * @param {array} rawData - raw collection
   * @return {array} - correct values
   */
  cast(schema, rawData) {
    // TODO: is it need to support of udefined and null?
    if (!_.isArray(rawData)) return rawData;

    // do nothing if there isn't schema for assoc
    // TODO: is it need to return [] of undefined?
    if (!schema.item) return;

    const itemSchema = {
      type: 'assoc',
      items: schema.item,
    };

    const castedData = [];

    _.each(rawData, (rawValue, index) => {
      // TODO: наверное оставить значение как есть чтобы потом валидировать
      if (!_.isPlainObject(rawValue)) return;
      castedData[index] = this._typeManager.castValue(itemSchema, rawValue);
    });

    return castedData;
  }

}
