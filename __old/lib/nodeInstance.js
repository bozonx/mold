/**
 * Object wrapper for work with data or schema by path
 */

var _ = require('lodash');
var schema = require('schema/schema.js');
var composition = require('composition.js');
var log = require('log.js');
//import * as log from 'log.js';

class NodeInstance {
  constructor (path) {
    this.configure(path)
  }

  configure (path) {
    // TODO: test it
    if (_.isUndefined(path)) {
      this._path = '';
    }
    else if (_.isString(path)){
      this._path = path;
    }
    else {
      log.fatal('bad type of path');
    }
  }

  /**
   * Get root of current instance
   * @returns {string}
   */
  getRoot () {
    return '' + this._path;
  }

  /**
   * Get schema of current instance if it exists.
   * @param path
   * @returns {Object|undefined} Schema or undefined if it doesn't exist.
   */
  getSchema (path) {
    let fullPath = this._combinePath(path);
    if (!this._checkSchema(fullPath)) return;
    return schema.getSchema(fullPath);
  }

  /**
   * Set new schema
   * @param param1
   * @param param2
   * @returns {*}
     */
  schema (param1, param2) {
    //if (_.isUndefined(param2)) {
    //  return schema.setSchema(param1);
    //}
    //else {
    //  return schema.setSchema(this._combinePath(param1), param2);
    //}

    let path, newSchema;
    if (_.isUndefined(param2)) {
      path = '';
      newSchema = param1;
    }
    else {
      path = param1;
      newSchema = param2;
    }

    let fullPath = this._combinePath(path);
    //if (!this._checkSchema(fullPath)) return;

    if (fullPath) {
      return schema.setSchema(fullPath, newSchema);
    }
    else {
      return schema.setSchema(newSchema);
    }
  }

  /**
   * Get composition of instance or by path
   * @param {String|undefined} path - if undefined then it uses root path of this instance
   * @return {Object|undefined}
   */
  composition (path) {
    let fullPath = this._combinePath(path);
    if (!this._checkSchema(fullPath)) return;
    return composition.getValue(fullPath);
  }

  /**
   * Get new instance of underlying leafs
   * @param {String} path
   * @returns {NodeInstance} New instance by path
     */
  get (path) {
    // TODO: path can't be empty
    return new NodeInstance(this._combinePath(path));
  }

  set (path, value) {
    // TODO: может быть передан 1 аргумент
    let fullPath = this._combinePath(path);
    return composition.setValue(fullPath, value);
  }

  _combinePath (path) {
    if (_.isUndefined(path)) {
      return this._path;
    }
    else if (_.isString(path))  {
      return _.compact([this._path, path]).join('.');
    }
    else {
      // TODO: test it
      log.fatal('bad type of path');
    }
  }

  /**
   * Check for schema existence.
   * @private
   * @returns {Boolean}
   */
  _checkSchema (fullPath) {
    if (!schema.hasSchema(fullPath)) {
      log.error(`Schema "${fullPath}" doesn't exist.`);
      return false;
    }
    return true;
  }
}

module.exports = {
  getInstance: function (path) {
    return new NodeInstance(path);
  }
};
