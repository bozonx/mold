var _ = require('lodash');
var composition = require('composition.js');
var boolean = require('schema/boolean.js');
var number = require('schema/number.js');
var string = require('schema/string.js');
var struct = require('schema/struct.js');
var schema = require('schema/schema.js');

module.exports = {
  getSchema: _.bind(schema.getSchema, schema),
  schema: _.bind(schema.setSchema, schema),
  composition: _.bind(composition.getValue, composition),
  set: _.bind(composition.setValue, composition),
  boolean: _.bind(boolean.schema, boolean),
  number: _.bind(number.schema, number),
  string: _.bind(string.schema, string),
  struct: _.bind(struct.schema, struct),
  // Reset schema and composition. Only for tests
  $$reset: function () {
    schema.$$reset();
    composition.$$reset();
  }

  // TODO: add get() - return object-wrapper
  // TODO: Is need to add immutable???
};
