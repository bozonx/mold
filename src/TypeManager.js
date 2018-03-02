const ArrayType = require('./primitives/ArrayType');
const AssocType = require('./primitives/AssocType');
const BooleanType = require('./primitives/BooleanType');
const NumberType = require('./primitives/NumberType');
const StringType = require('./primitives/StringType');


/**
 * It manages of primitive types: string, number, boolean, array, assoc.
 * @class
 */
module.exports = class TypeManager {
  constructor(main) {
    this._main = main;
    this._types = {
      string: new StringType(this),
      number: new NumberType(this),
      boolean: new BooleanType(this),
      array: new ArrayType(this),
      assoc: new AssocType(this),
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
   * @return {string|undefined} - It returns error message of undefined if there wasn't an error.
   */
  validateSchema(schema) {
    if (!this._types[schema.type]) return `Type hasn't registered`;

    return this._types[schema.type].validateSchema(schema);
  }

  /**
   * Validate previously casted value.
   * Value is invalid if it wasn't casted correctly.
   * @param {object} schema - schema of primitive
   * @param {*} value - previously casted value
   * @return {string|undefined} - It returns error message of undefined if there wasn't an error.
   */
  validateValue(schema, value) {
    if (!this._types[schema.type]) return `Type "${schema.type}" hasn't registered`;

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

};
