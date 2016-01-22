var _ = require('lodash');
var composition = require('composition.js');

class Schema {
  constructor () {
    this._schema = {};
  }

  // Return value of path or undefined if it doesn't exists
  // @param {String} path - path like "parent.child". If it undefined, then will be returned full schema
  getSchema (path) {
    // TODO: return immutable or _.cloneDeep. And test it
    if(_.isUndefined(path)) {
      // get full schema
      return this._schema;
    }
    else if (_.isString(path)) {
      // get schema part by path
      let realPath = this._toRealPath(path);
      return _.get(this._schema, realPath);
    }
    else {
      // TODO: exeption - unsupported type of "path" argument
    }
  }

  // set schema by path
  // @param {String} path - path like 'path.to.node'. Or '/' to set full schema
  // @param {Object} schema - you valid schema
  setSchema (path, schema) {
    if (!_.isString(path)) {
      // TODO: exeption - unsupported type of "path" argument or unsupported type of "value" argument
    }

    this._validate(schema);

    if (path === '/') {
      // TODO: it must be struct. test it
      // set full schema
      this._schema = schema;
    }
    else {
      // set schema to path
      let realPath = this._toRealPath(path);
      _.set(this._schema, realPath, schema);
    }

    // start generate clear composition of this schema
    this._generateFromSchema(path, schema);
  }

  _generateFromSchema (path, schema) {
    //let data = null;
    //// TODO: gen data from schema
    //composition.$set(path, data);
  }

  // add ".children." to path. 'parent.node' => 'parent.children.node'
  _toRealPath (path) {
    return path.replace(/\./g, '.children.')
  }

  _validate (schema) {
    // TODO: validate
    // должен быть параметр type у всех узлов и он должен быть один из зарегистрированных
    // должен быть children у всех узлов кроме простых типов
    // валидировать параметры - запускать валидацию каждого типа
    // выдавать исключение при любой ошибке
  }

  // Reset schema. Only for tests
  $$reset () {
    this._schema = {};
  }
}

var schema = new Schema();
module.exports = schema;