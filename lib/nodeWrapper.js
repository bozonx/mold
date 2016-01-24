/**
 * Object wrapper for work with data or schema by path
 */

//var _ = require('lodash');
//var mold = require('index.js');

import * as mold from 'index.js';


// TODO: test it

class NodeWrapper {
  constructor (path) {
    // TODO: check path
    this.path = path;
  }

  getSchema (path, schema) {
    // TODO: может быть передан 1 аргумент
    mold.getSchema(this._combinePath(path), schema);
  }

  schema (path) {
    mold.schema(this._combinePath(path));
  }

  /**
   * Get composition of instance or by path
   * @param {String|undefined} path - if undefined then it uses root path of this instance
   * @return {Object}
   */
  composition (path) {
    mold.composition(this._combinePath(path));
  }

  get (path) {
    mold.get(this._combinePath(path));
  }

  set (path, value) {
    // TODO: может быть передан 1 аргумент
    mold.set(this._combinePath(path, value));
  }

  _combinePath (path) {
    if (_.isUndefined(path)) {
      return this.path;
    }
    else if (_.isString(path))  {
      return this.path + '.' + path;
    }
    else {
      // TODO: exeption - bad type of path. fatal
    }
  }
}

module.exports = {
  getInstance: function (path) {
    return new NodeWrapper(path);
  }
};
