var _ = require('lodash');
var composition = require('composition.js');
var basicTypes = require('schema/basicTypes.js');
var struct = require('schema/struct.js');
var schema = require('schema/schema.js');

module.exports = {
  schema: function (path, value) {
    // give 0 params = get full schema
    if (_.isUndefined(path) && _.isUndefined(value)) {
      return schema.getSchema();
    }
    // give one param = get schema by path
    else if (_.isString(path) && _.isUndefined(value)) {
      return schema.getSchema(path);
    }
    // give 2 params = set schema by path
    else if (_.isString(path) && !_.isUndefined(value)) {
      schema.setSchema(path, value);
    }
    // call of schema() without params doesn't suport
  },
  composition: _.bind(composition.getValue, composition),
  set: _.bind(composition.setValue, composition),
  boolean: _.bind(basicTypes.boolean, basicTypes),
  number: _.bind(basicTypes.number, basicTypes),
  string: _.bind(basicTypes.string, basicTypes),
  struct: _.bind(struct.struct, struct),

  // TODO: add get() - return object-wrapper
  // TODO: Is need to add immutable???
};
