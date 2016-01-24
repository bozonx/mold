var _ = require('lodash');
var log = require('log.js');
//var composition = require('composition.js');

class Schema {
  constructor () {
    this._schema = {};
  }

  // Return cloned schema of path or undefined if it doesn't exists.
  // @param {String} path - path like "parent.child". If it undefined, then will be returned full schema
  getSchema (path) {
    if(_.isUndefined(path) || path === '') {
      // get full schema
      return _.cloneDeep(this._schema);
    }
    else if (_.isString(path)) {
      // get schema part by path
      let realPath = this._toRealPath(path);
      let schemaByPath = _.get(this._schema, realPath);
      return _.cloneDeep(schemaByPath);
    }
    else {
      log.error('Unsupported type of "path" argument');
    }
  }

  // set schema by path
  // 2 ways for use:
  // * schema.setSchema({ schema }) - set root schema
  // * schema.setSchema('path.to', { schema })
  // @param {String|Object} path
  // @param {Object|undefined} schema - you valid schema
  setSchema (param1, param2) {
    var path, schema;
    if (_.isString(param1) && _.isPlainObject(param2)) {
      path = param1;
      schema = param2;
    }
    else if (_.isPlainObject(param1) && _.isUndefined(param2)) {
      path = '';
      schema = param1;
    }
    else {
      log.error('Unsupported arguments');
      return
    }

    this._validate(schema);

    // TODO: refactor
    if (path === '') {
      // TODO: it must be struct. test it
      // set full schema
      this._schema = schema;
    }
    else {
      // check for path's parents exists
      if (this._validatePath(path)) {
        // set schema to path
        let realPath = this._toRealPath(path);
        _.set(this._schema, realPath, schema);
      }
    }

    // start generate clear composition of this schema
    // TODO: ??????
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

  _validatePath (path) {
    if (path.split('.').length === 1) return true;

    var pathParents = path.replace(/\.[^.]+$/, '');
    if (_.isUndefined(_.get(this._schema, pathParents))) {
      log.error('Parent of path "' + path + '" doesn\'t exist.');
      return false;
    }
    else {
      return true;
    }
  }

  _validate (schema) {
    // TODO: validate given schema and all children
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

module.exports = new Schema();
