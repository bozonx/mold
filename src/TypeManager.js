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

  getInitial(typeName) {
    return this._types[typeName].getInitial();
  }

  isRegistered(typeName) {
    return Boolean(this._types[typeName]);
  }

  /**
   * Validate schema
   * @param {object} schema - schema of primitive
   * @return {string|boolean} - true if valid or error message if invalid.
   */
  validateSchema(schema) {
    return this._types[schema.type].validateSchema(schema);
  }

  /**
   * Validate previously casted value.
   * Value is invalid if it wasn't casted correctly.
   * @param {object} schema - schema of primitive
   * @param {*} value - previously casted value
   * @return {boolean} - true if value is correct, otherwise false.
   */
  validateValue(schema, value) {
    return this._types[schema.type].validate(schema, value);
  }

  /**
   * Try to normalize value e.g. '10' => 10, 'true' => true etc.
   * If it can't cast a value it will let it as is.
   * It allows undefined and null as a value for each type.
   * @param {object} schema - schema of primitive
   * @param {*} value - raw value
   * @return {*} - correct value for primitive type.
   */
  castValue(schema, value) {
    return this._types[schema.type].cast(schema, value);
  }

}
