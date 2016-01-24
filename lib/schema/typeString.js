//var _ = require('lodash');
var common = require('./_common');

class TypeString {
  constructor () {
  }

  schema (firstArgument, secondArgument) {
    return common.generateNode('string', firstArgument, secondArgument);
  }

  validate (value) {
    // TODO:
  }

  validateSchema (compiledSchema) {
    var errors = [];
    if (compiledSchema.type !== 'string') {
      errors.push('It\'s not string type');
    }
    // TODO: validate params

    if (_.isEmpty(errors)) return true;
    return errors;
  }
}

module.exports = new TypeString();
