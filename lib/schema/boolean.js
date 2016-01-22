//var _ = require('lodash');
var common = require('./_common');

class Bool {
  constructor () {
  }

  /**
   * Set boolean value to schema
   * You can use 3 form of method call:
   * * mold.boolean()
   * * mold.boolean({params})
   * * mold.boolean(predefinedValue, {params})
   */
  schema (firstArgument, secondArgument) {
    return common.generateNode('boolean', firstArgument, secondArgument);
  }

  validate (value) {
    // TODO:
  }

  validateSchema (compiledSchema) {
    var errors = [];
    if (compiledSchema.type !== 'boolean') {
      errors.push('It\'s not boolean type');
    }
    // TODO: validate params

    if (_.isEmpty(errors)) return true;
    return errors;
  }
}

module.exports = new Bool();
