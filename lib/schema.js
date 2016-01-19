var _ = require('lodash');
var composition = require('composition.js');

class Schema {
  constructor () {
    this._commonSchema = {};
  }

  // Return value of path or undefined if it doesn't exists
  getSchema (path) {
    if(_.isUndefined(path)) {
      return this._commonSchema;
    }
    else {
      return _.get(this._commonSchema, path);
    }
  }

  setSchema (path, rawSchema) {
    // parse schema and validate its
    var schema = this._normalizeSchema(rawSchema);
    // set schema to node
    _.set(this._commonSchema, path, schema);
    // start generate clear composition of this schema
    this._generateFromSchema(path, schema);
  }

  _generateFromSchema (path, schema) {
    var data = null;
    // TODO: gen data from schema
    composition.$set(path, data);
  }

  _normalizeSchema (rawSchema) {
    // TODO: normalize params if need
    // TODO: validate params
    return rawSchema;
  }
}

var schema = new Schema();

module.exports = function (path, value) {
  if (_.isString(path) && _.isUndefined(value)) {
    return schema.getSchema(path)
  }
  else if (_.isUndefined(path) && _.isUndefined(value)) {
    return schema.getSchema()
  }
  else if (_.isString(path) && !_.isUndefined(value)) {
    schema.setSchema(path, value)
  }
  // call of schema() without params doesn't suport
};
