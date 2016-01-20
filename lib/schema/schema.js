var _ = require('lodash');
var composition = require('composition.js');

// TODO: add set full schema, it must be struct

class Schema {
  constructor () {
    this._schema = {};
  }

  // Return value of path or undefined if it doesn't exists
  // @param {String} path - path like "parent.child". If it undefined, then will be returned full schema
  getSchema (path) {
    if(_.isUndefined(path)) {
      // get full schema
      return this._schema;
    }
    else {
      // get schema part by path
      let realPath = this._toRealPath(path);
      return _.get(this._schema, realPath);
    }
  }

  setSchema (path, rawSchema) {


    // parse schema and validate its
    let schema = this._normalizeSchema(rawSchema);
    // set schema to node
    _.set(this._schema, path, schema);
    // start generate clear composition of this schema
    this._generateFromSchema(path, schema);
  }

  _generateFromSchema (path, schema) {
    let data = null;
    // TODO: gen data from schema
    composition.$set(path, data);
  }

  _normalizeSchema (rawSchema) {
    // TODO: normalize params if need
    // TODO: validate params
    return rawSchema;
  }

  // add ".children." to path. 'parent.node' => 'parent.children.node'
  _toRealPath (path) {
    return path.replace(/\./g, '.children.')
  }
}

var schema = new Schema();
module.exports = schema;
