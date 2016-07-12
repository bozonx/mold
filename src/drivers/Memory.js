import _ from 'lodash';

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
          coocked: resp,
          successResponse: resp,
          request,
        });
      }
      else {
        reject({
          error: 'not found',
          request,
        });
      }
    });
  }

  set(request) {
    return new Promise((resolve, reject) => {
      _.set(this._db, request.fullPath, request.payload);
      resolve({
        coocked: request.payload,
        successResponse: request.payload,
        request,
      });
    });

  }

  // add(request) {
  //   return new Promise((resolve, reject) => {
  //     var collection = _.get(this._db, request.fullPath);
  //     var newValue;
  //
  //     if (_.isUndefined(collection)) {
  //       // create new collection
  //       newValue = {
  //         [request.primaryKeyName]: 0,
  //         ...request.payload,
  //         $index: 0,
  //       };
  //       _.set(this._db, request.fullPath, [newValue]);
  //     }
  //     else {
  //       // add item to existent collection
  //       newValue = {
  //         [request.primaryKeyName]: collection.length,
  //         ...request.payload,
  //         $index: collection.length,
  //       };
  //       collection[collection.length] = newValue;
  //     }
  //
  //     resolve({
  //       coocked: newValue,
  //       successResponse: newValue,
  //       request,
  //     });
  //   });
  // }
  //
  // remove(request) {
  //   return new Promise((resolve, reject) => {
  //     var collection = _.get(this._db, request.fullPath);
  //
  //     if (!collection) {
  //       reject({
  //         error: 'Collection not found',
  //       });
  //       return;
  //     }
  //
  //     var item = _.find(collection, request.payload);
  //     if (!item || !_.isNumber(item[request.primaryKeyName])) {
  //       reject({
  //         error: 'Item not found',
  //         request,
  //       });
  //       return;
  //     }
  //
  //     var newCollection = _.filter(collection, (value) => {return value[request.primaryKeyName] !== item[request.primaryKeyName]});
  //     _.set(this._db, request.fullPath, newCollection);
  //
  //     resolve({
  //       coocked: item,
  //       successResponse: item,
  //       request,
  //     });
  //   });
  // }

  requestHandler(request) {
    return this[request.method](request);
  }

}

/**
 * Instance of this class creates once a mold instance
 */
export default function (driverConfig) {
  this.driverConfig = driverConfig;
  if (_.isPlainObject(driverConfig.db)) {
    this.db = driverConfig.db;
  }
  else {
    this.db = {};
  }

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
