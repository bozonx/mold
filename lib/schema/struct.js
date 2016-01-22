//var _ = require('lodash');

class Struct {
  constructor () {
  }

  schema (children) {
    var node = {};
    node.type = 'struct';
    // TODO: how to validate struct? - наверное значения должны быть одни из наших, не может быть пустого struct
    node.children = children;
    return node;
  }

  validate (value) {
    // TODO: нужно валидировать то что нельзя добавлять/удалять элементы
  }

  validateSchema (compiledSchema) {
    var errors = [];
    if (compiledSchema.type !== 'struct') {
      errors.push('It\'s not struct type');
    }
    if (_.isUndefined(compiledSchema.children)) {
      errors.push('Struct can\'t be empty');
    }

    if (_.isEmpty(errors)) return true;
    return errors;
  }
}

module.exports = new Struct();
