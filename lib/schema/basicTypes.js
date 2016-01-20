var _ = require('lodash');

class BasicTypes {
  constructor () {
  }

  /**
   * Set boolean value to schema
   * You can use 3 form of method call:
   * * mold.boolean()
   * * mold.boolean({params})
   * * mold.boolean(predefinedValue, {params})
   */
  boolean (firstArgument, secondArgument) {
    return this._generateNode('boolean', firstArgument, secondArgument);
  }

  number (firstArgument, secondArgument) {
    return this._generateNode('number', firstArgument, secondArgument);
  }

  string (firstArgument, secondArgument) {
    return this._generateNode('string', firstArgument, secondArgument);
  }

  _generateNode (myType, firstArgument, secondArgument) {
    var parsed = this._parseArguments(myType, firstArgument, secondArgument);
    var node = {};
    var validParams = this._validateParams(myType, parsed.params);
    _.assignIn(node, validParams);
    node.type = myType;
    node.value = parsed.value;
    return node;
  }

  _parseArguments (type, firstArgument, secondArgument) {
    var predefinedValue, params;
    var isValueCorrectType = _['is' + _.capitalize(type)](firstArgument);

    if (_.isUndefined(firstArgument) && _.isUndefined(secondArgument)) {
      // TODO: use default value
      predefinedValue = null;
      params = undefined;

    }
    // if receive predefined value only
    else if (isValueCorrectType && _.isUndefined(secondArgument)) {

      predefinedValue = firstArgument;
      params = undefined;
    }
    // if only receive "secondArgument" argument
    else if (_.isPlainObject(firstArgument) && _.isUndefined(secondArgument)) {
      // TODO: use default value
      predefinedValue = null;
      params = firstArgument;
    }
    // if receive predefined value and params arguments
    else if (isValueCorrectType && _.isPlainObject(secondArgument)) {
      predefinedValue = firstArgument;
      params = secondArgument;
    }
    else {
      // TODO: exeption - unexpected type of params or predefinedValue
    }

    return {
      value: predefinedValue,
      params: params,
    }
  }

  _validateParams (type, params) {
    if (_.isUndefined(params)) return {};
    // TODO: validate params
    // TODO: ??? set default value
    return params;
  }
}

var basicTypes = new BasicTypes();
module.exports = basicTypes;
