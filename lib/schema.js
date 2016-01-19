
//class Schema {
//  constructor() {
//    this._schema = {};
//  }
//
//  getSchema(path) {
//    // TODO: сделать нормально
//    return this._schema;
//  }
//
//  setSchema(path, schema) {
//    // TODO: сделать нормально
//    this._schema = schema;
//  }
//}

var Schema = function () {
  this._schema = {};
}

Schema.prototype = {
  getSchema: function (path) {
    // TODO: сделать нормально
    return this._schema;
  },

  setSchema: function (path, schema) {
    // TODO: сделать нормально
    this._schema = schema;
  },
};

var schema = new Schema();

module.exports = function (param1, param2) {
  // TODO: add lodash
  if (param1 && !param2) {
    return schema.getSchema(param1)
  }
  if (param1 && param2) {
    schema.setSchema(param1, param2)
  }
  // call of schema() without params doesn't suport
};
