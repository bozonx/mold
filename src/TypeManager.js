import _ from 'lodash';

import castData from './helpers/castData';
import ArrayType from './primitives/ArrayType';
import AssocType from './primitives/AssocType';
import BooleanType from './primitives/BooleanType';
import CollectionType from './primitives/CollectionType';
import NumberType from './primitives/NumberType';
import StringType from './primitives/StringType';


export default class TypeManager {
  constructor(main) {
    this._main = main;
    this._types = {
      array: new ArrayType(this),
      assoc: new AssocType(this),
      boolean: new BooleanType(this),
      collection: new CollectionType(this),
      number: new NumberType(this),
      string: new StringType(this),
    }
  }

  getType(typeName) {
    return this._types[typeName];
  }

  isRegistered(typeName) {
    return !!this._types[typeName];
  }

  validateSchema(schema) {
    return this._types[schema.type].validateSchema(schema);
  }

  validateValue(schema, value) {
    return this._types[schema.type].validate(value);
  }

  castValue(schema, rawValue) {
    return this._types[schema.type].cast(schema, rawValue);
  }

  getInitial(typeName) {
    return this._types[typeName].getInitial();
  }

  castData(moldPath, data) {
    // TODO: первый уровень обязан быть {}

    const schema = this._main.$$schemaManager.getSchema(moldPath);

    //return castData(moldPath, schema, data, this.castValue.bind(this));

    const castedData = {};

    _.each(data, (rawValue, name) => {
      castedData[name] = this._types[schema.type].cast(rawValue);
    });

    return castedData;
  }

}
