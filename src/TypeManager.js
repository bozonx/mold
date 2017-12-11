import _ from 'lodash';

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

  castData(schema, data) {
    if (schema.type !== 'assoc') {
      this._main.$$log.fatal(`Incorrect schema, it has to be assoc: ${JSON.stringify(data)}`);
    }
    if (!_.isPlainObject(data)) {
      this._main.$$log.fatal(`Incorrect data, it has to be plain object: ${JSON.stringify(data)}`);
    }

    return this.castValue(schema, data);
  }

}
