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
    this.types = {
      array: new ArrayType(),
      assoc: new AssocType(),
      boolean: new BooleanType(),
      collection: new CollectionType(),
      number: new NumberType(),
      string: new StringType(),
    }
  }

  isRegistered(typeName) {
    return !!this.types[typeName];
  }

  validateSchema(schema) {
    return this.types[schema.type].validateSchema(schema);
  }

  validateValue(schema, value) {
    return this.types[schema.type].validate(value);
  }

  castValue(schema, rawValue) {
    return this.types[schema.type].cast(rawValue);
  }

  getInitial(typeName) {
    return this.types[typeName].getInitial();
  }

  castData(moldPath, data) {
    const schema = this._main.$$schemaManager.getSchema(moldPath);

    return castData(moldPath, schema, data);
  }

}
