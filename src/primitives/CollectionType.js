import _ from 'lodash';

import { isCollection } from '../helpers/helpers';


export default class CollectionType {
  constructor(typeManager) {
    this._typeManager = typeManager;
  }

  getInitial() {
    return [];
  }

  validate(schema, data) {
    if (!isCollection(data)) return false;

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

  validateSchema(schema) {
    // TODO: do it
    return true;
  }

  cast(schema, data) {
    // do nothing if there isn't schema for assoc
    if (!schema.item) return;

    const itemSchema = {
      type: 'assoc',
      items: schema.item,
    };

    const castedData = [];

    _.each(data, (rawValue, index) => {
      if (!_.isPlainObject(rawValue)) return;
      castedData[index] = this._typeManager.castValue(itemSchema, rawValue);
    });

    return castedData;
  }

}
