/**
 * Object wrapper for work with data or schema by path
 */

var _ = require('lodash');
import * as log from 'log.js';
var schema = require('schema/schema.js');
var composition = require('composition.js');

class NodeInstance {
  constructor (path) {
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
    //if (!this._checkSchema(path)) return;
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

  // Get new instance of underlying leafs
  get (path) {
    return new NodeInstance(this._combinePath(path));
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
  _checkSchema (path) {
    var fullPath = this._combinePath(path);
    if (!schema.hasSchema(fullPath)) {
      log.error(`Schema ${fullPath} doesn't exist.`);
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
