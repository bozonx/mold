var _ = require('lodash');
var composition = require('composition.js');
var basicTypes = require('schema/basicTypes.js');
var struct = require('schema/struct.js');
var schema = require('schema/schema.js');

module.exports = {
  schema: schema,
  composition: _.bind(composition.getValue, composition),
  set: _.bind(composition.setValue, composition),
  boolean: _.bind(basicTypes.boolean, basicTypes),
  number: _.bind(basicTypes.number, basicTypes),
  string: _.bind(basicTypes.string, basicTypes),
  struct: _.bind(struct.struct, struct),

  // TODO: add get() - return object-wrapper
  // TODO: Is need to add immutable???
};
