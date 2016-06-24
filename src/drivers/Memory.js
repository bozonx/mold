var _ = require('lodash');

class LocalMemory {
  constructor(driverConfig, instanceConfig, db) {
    this._driverConfig = driverConfig;
    this._instanceConfig = instanceConfig;
    this._db = db;
  }

  /**
   * It runs on schema init.
   * @param {string} root - absolute root in main schema
   * @param {MoldInstance} main
   */
  init(root, main) {
    this._root = root;
    this._main = main;
  }

  get(request) {
    return new Promise((resolve, reject) => {
      var resp = _.get(this._db, request.fullPath);
      if (!_.isUndefined(resp)) {
        resolve({
          payload: resp,
          successResponse: resp,
          request,
        });
      }
      else {
        reject({
          errorResponse: 'not found',
          request,
        });
      }
    });
  }

  // find(request, resolve, reject) {
  //   var collection = _.get(this._db, request.fullPath);
  //   var found = _.find(collection, request.payload);
  //
  //   if (!_.isUndefined(found)) {
  //     resolve({
  //       payload: found,
  //       successResponse: found,
  //     });
  //   }
  //   else {
  //     reject({
  //       errorResponse: 'not found',
  //     });
  //   }
  // }
  //
  // filter(request, resolve, reject) {
  //   var collection = _.get(this._db, request.fullPath);
  //   var found = _.filter(collection, request.payload);
  //
  //   resolve({
  //     payload: found,
  //     successResponse: found,
  //   });
  // }

  set(request) {
    return new Promise((resolve, reject) => {
      _.set(this._db, request.fullPath, request.payload);
      resolve({
        payload: request.payload,
        successResponse: request.payload,
        request,
      });
    });

  }

  add(request) {
    return new Promise((resolve, reject) => {
      var collection = _.get(this._db, request.fullPath);
      var newValue;

      if (_.isUndefined(collection)) {
        // create new collection
        newValue = {
          [request.primaryKeyName]: 0,
          ...request.payload,
          $index: 0,
        };
        _.set(this._db, request.fullPath, [newValue]);
      }
      else {
        // add item to existent collection
        newValue = {
          [request.primaryKeyName]: collection.length,
          ...request.payload,
          $index: collection.length,
        };
        collection[collection.length] = newValue;
      }

      resolve({
        payload: newValue,
        successResponse: newValue,
        request,
      });
    });
  }

  remove(request) {
    return new Promise((resolve, reject) => {
      var collection = _.get(this._db, request.fullPath);

      if (!collection) {
        reject({
          errorResponse: 'Collection not found',
        });
        return;
      }

      var item = _.find(collection, request.payload);
      if (!item || !_.isNumber(item[request.primaryKeyName])) {
        reject({
          errorResponse: 'Item not found',
          request,
        });
        return;
      }

      var newCollection = _.filter(collection, (value) => {return value[request.primaryKeyName] !== item[request.primaryKeyName]});
      _.set(this._db, request.fullPath, newCollection);

      resolve({
        payload: item,
        successResponse: item,
        request,
      });
    });
  }

  requestHandler(request) {
    return this[request.type](request);
  }

}

/**
 * Instance of this class creates once a mold instance
 */
export default function (driverConfig) {
  this.driverConfig = driverConfig;
  this.db = {};

  /**
   * Schema helper
   * @param {object} instanceConfig
   * @param {object} schema
   * @returns {{driver: LocalMemory, schema: *}}
   */
  this.schema = (instanceConfig, schema) => {
    return {
      driver: new LocalMemory(this.driverConfig, instanceConfig, this.db),
      schema: schema,
    }
  }
}
