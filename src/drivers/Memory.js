var _ = require('lodash');

class LocalMemory {
  constructor(driverConfig, instanceConfig, db) {
    this._driverConfig = driverConfig;
    this._instanceConfig = instanceConfig;
    this._db = db;




    // return new Promise((resolve) => {
    //   if (params.type == 'find') {
    //     let list = this.getComposition(params.fullPath);
    //     resolve( _.find(list, params.payload) );
    //   }
    //   else if (params.type == 'filter') {
    //     let list = this.getComposition(params.fullPath);
    //     resolve( _.filter(list, params.payload) );
    //   }
    //   // else if (params.type == 'add') {
    //   //   let newItem = {
    //   //     payload: {
    //   //       ...params.payload,
    //   //       $primary: params.payload.id,
    //   //     }
    //   //   };
    //   //   resolve( newItem );
    //   // }
    //   // else if (params.type == 'remove') {
    //   //   let newItem = {
    //   //     payload: {
    //   //       ...params.payload,
    //   //       $primary: params.payload.id,
    //   //     }
    //   //   };
    //   //   resolve( newItem );
    //   // }
    //   else {
    //     resolve( this.getComposition(params.fullPath) );
    //   }
    // });

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

  get(request, resolve, reject) {
    var resp = _.get(this._db, request.fullPath);
    if (!_.isUndefined(resp)) {
      resolve({
        payload: resp,
        successResponse: resp,
      });
    }
    else {
      reject({
        errorResponse: 'not found',
      });
    }
  }

  find(request, resolve, reject) {
    // TODO:
  }

  filter(request, resolve, reject) {
    // TODO:
  }

  set(request, resolve, reject) {
    _.set(this._db, request.fullPath, request.payload);
    resolve({
      payload: request.payload,
      successResponse: request.payload,
    });
  }

  add(request, resolve, reject) {
    var collection = _.get(this._db, request.fullPath);
    var newValue;

    if (_.isUndefined(collection)) {
      // create new collection
      newValue = {
        [request.primaryKeyName]: 0,
        ...request.payload,
        $primary: 0,
      };
      _.set(this._db, request.fullPath, [newValue]);
    }
    else {
      // add item to existent collection
      newValue = {
        [request.primaryKeyName]: collection.length,
        ...request.payload,
        $primary: collection.length,
      };
      collection[collection.length] = newValue;
    }

    resolve({
      payload: newValue,
      successResponse: newValue,
    });
  }

  remove(request, resolve, reject) {
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
      });
      return;
    }

    var newCollection = _.filter(collection, (value) => {return value[request.primaryKeyName] !== item[request.primaryKeyName]});
    _.set(this._db, request.fullPath, newCollection);

    resolve({
      payload: item,
      successResponse: item,
    });
  }

  requestHandler(request, resolve, reject) {
    this[request.type](request, resolve, reject);
  }

}

/**
 * Instance of this class creates once a mold instance
 */
export default class Memory {
  constructor(driverConfig) {
    this.driverConfig = driverConfig;
    this.db = {};
  }

  /**
   * Schema helper
   * @param {object} instanceConfig
   * @param {object} schema
   * @returns {{driver: LocalMemory, schema: *}}
   */
  schema(instanceConfig, schema) {
    return {
      driver: new LocalMemory(this.driverConfig, instanceConfig, this.db),
      schema: schema,
    }
  }
}
