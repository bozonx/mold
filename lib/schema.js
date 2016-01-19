var _ = require('lodash');

class Schema {
  constructor() {
    this._schema = {};
  }

  getSchema(path) {
    // TODO: сделать нормально
    return this._schema;
  }

  setSchema(path, schema) {
    // TODO: сделать нормально
    this._schema = schema;
  }
}

var schema = new Schema();

module.exports = function (path, value) {
  if (_.isString(path) && _.isUndefined(value)) {
    return schema.getSchema(path)
  }
  if (_.isString(path) && !_.isUndefined(value)) {
    schema.setSchema(path, value)
  }
  // call of schema() without params doesn't suport
};
