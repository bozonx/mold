var _ = require('lodash');
var composition = require('composition.js');

class Schema {
  constructor () {
    this._schema = {};
  }

  // Return value of path or undefined if it doesn't exists
  getSchema (path) {
    if(_.isUndefined(path)) {
      return this._schema;
    }
    else {
      return _.get(this._schema, path);
    }
  }

  setSchema (path, rawSchema) {
    // parse schema and validate its
    var schema = this._normalizeSchema(rawSchema);
    // set schema to node
    _.set(this._schema, path, schema);
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

// TODO: ???? move to index.js
module.exports = function (path, value) {
  // give 0 params = get full schema
  if (_.isUndefined(path) && _.isUndefined(value)) {
    return schema.getSchema()
  }
  // give one param = get schema by path
  else if (_.isString(path) && _.isUndefined(value)) {
    return schema.getSchema(path)
  }
  // give 2 params = set schema by path
  else if (_.isString(path) && !_.isUndefined(value)) {
    schema.setSchema(path, value)
  }
  // call of schema() without params doesn't suport
};
