import _ from 'lodash';

import ArrayType from './primitives/ArrayType';
import AssocType from './primitives/AssocType';
import BooleanType from './primitives/BooleanType';
import CollectionType from './primitives/CollectionType';
import NumberType from './primitives/NumberType';
import StringType from './primitives/StringType';


/**
 * It manages of primitive types: string, number, boolean, array, assoc, collection.
 * @class
 */
export default class TypeManager {
  constructor(main) {
    this._main = main;
    this._types = {
      string: new StringType(this),
      number: new NumberType(this),
      boolean: new BooleanType(this),
      array: new ArrayType(this),
      assoc: new AssocType(this),
      collection: new CollectionType(this),
    };
  }

  getType(typeName) {
    return this._types[typeName];
  }

  isRegistered(typeName) {
    return Boolean(this._types[typeName]);
  }

  validateSchema(schema) {
    return this._types[schema.type].validateSchema(schema);
  }

  validateValue(schema, value) {
    return this._types[schema.type].validate(schema, value);
  }

  // TODO: вообще нигде не используется
  validateData(schema, data) {
    //this._validateParams(schema, data);

    return this.validateValue(schema, data);
  }

  // TODO: это только для типов - нужно переименовать чтобы не путать с castData
  castValue(schema, value) {
    return this._types[schema.type].cast(schema, value);
  }

  getInitial(typeName) {
    return this._types[typeName].getInitial();
  }


  castData(schema, data) {
    //this._validateParams(schema, data);

    return this.castValue(schema, data);
  }

  // TODO: не нужен метод, так как в молд и так будет либо assoc либо collection
  // _validateParams(schema, data) {
  //   if (schema.type === 'assoc') {
  //     if (!_.isPlainObject(data)) {
  //       this._main.$$log.fatal(`Incorrect data, it has to be a plain object: ${JSON.stringify(data)}`);
  //     }
  //   }
  //   else if (schema.type === 'collection') {
  //     if (!_.isArray(data)) {
  //       this._main.$$log.fatal(`Incorrect data, it has to be an array: ${JSON.stringify(data)}`);
  //     }
  //   }
  //   else {
  //     this._main.$$log.fatal(`Incorrect schema, it has to be an assoc or collection: ${JSON.stringify(data)}`);
  //   }
  // }

}
