var _ = require('lodash');
var composition = require('composition.js');
var basicTypes = require('schema/basicTypes.js');
var struct = require('schema/struct.js');
var schema = require('schema/schema.js');

module.exports = {
  getSchema: function (path) {
    // TOdO: перенести проверки в schema
    // give 0 params = get full schema
    if (_.isUndefined(path)) {
      return schema.getSchema();
    }
    // give one param = get schema by path
    else if (_.isString(path)) {
      return schema.getSchema(path);
    }
    else {
      // TODO: exeption - unsupported type of "path" argument
    }
  },
  schema: function (path, value) {
    // give 2 params = set schema by path
    if (_.isString(path) && _.isPlainObject(value)) {
      schema.setSchema(path, value);
    }
    else {
      // TODO: exeption - unsupported type of "path" argument or unsupported type of "value" argument
    }
  },
  composition: _.bind(composition.getValue, composition),
  set: _.bind(composition.setValue, composition),
  boolean: _.bind(basicTypes.boolean, basicTypes),
  number: _.bind(basicTypes.number, basicTypes),
  string: _.bind(basicTypes.string, basicTypes),
  struct: _.bind(struct.struct, struct),
  // Reset schema and composition. Only for tests
  $$reset: function () {
    schema.$$reset();
    composition.$$reset();
  }

  // TODO: add get() - return object-wrapper
  // TODO: Is need to add immutable???
};
