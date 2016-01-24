/**
 * Object wrapper for work with data or schema by path
 */

var _ = require('lodash');
//import * as mold from 'index.js';

var schema = require('schema/schema.js');

var composition = require('composition.js');

// TODO: test it

class NodeInstance {
  //getSchema: _.bind(schema.getSchema, schema),
  //schema: _.bind(schema.setSchema, schema),
  //composition: _.bind(composition.getValue, composition),
  //get: nodeWrapper.getInstance,
  //set: _.bind(composition.setValue, composition),


  constructor (path) {
    // TODO: test it
    if (_.isUndefined(path)) {
      this._path = '';
    }
    else if (_.isString(path)){
      this._path = path;
    }
    else {
      // TODO: exeption - bad type of path. fatal
    }
  }

  getSchema (path) {
    return schema.getSchema(this._combinePath(path));
  }

  schema (param1, param2) {
    if (_.isUndefined(param2)) {
      return schema.setSchema(param1);
    }
    else {
      return schema.setSchema(this._combinePath(param1), param2);
    }
  }

  /**
   * Get composition of instance or by path
   * @param {String|undefined} path - if undefined then it uses root path of this instance
   * @return {Object}
   */
  composition (path) {
    return composition.getValue(this._combinePath(path));
  }

  get (path) {
    // TODO: ????
    //return mold.get(this._combinePath(path));
  }

  set (path, value) {
    // TODO: может быть передан 1 аргумент
    return composition.setValue(this._combinePath(path), value);
  }

  _combinePath (path) {
    if (_.isUndefined(path)) {
      return this._path;
    }
    else if (_.isString(path))  {
      if (this._path === '') {
        return path;
      }
      else {
        return this._path + '.' + path;
      }
    }
    else {
      // TODO: exeption - bad type of path. fatal
    }
  }
}

module.exports = {
  getInstance: function (path) {
    return new NodeInstance(path);
  }
};
