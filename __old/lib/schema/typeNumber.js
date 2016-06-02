//var _ = require('lodash');
var common = require('./_common');

class typeNumber {
  constructor () {
  }

  schema (firstArgument, secondArgument) {
    return common.generateNode('number', firstArgument, secondArgument);
  }

  validate (value) {
    // TODO:
  }

  validateSchema (compiledSchema) {
    var errors = [];
    if (compiledSchema.type !== 'number') {
      errors.push('It\'s not number type');
    }
    // TODO: validate params

    if (_.isEmpty(errors)) return true;
    return errors;
  }
}

module.exports = new typeNumber();
