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
   * @param {Main} main
   */
  init(root, main) {
    this._root = root;
    this._main = main;
  }

  get(request) {
    return new Promise((resolve, reject) => {
      var resp = _.get(this._db, request.url);
      if (!_.isUndefined(resp)) {
        resolve({
          body: resp,
          driverResponse: resp,
          request,
        });
      }
      else {
        reject({
          driverError: 'not found',
          request,
        });
      }
    });
  }

  filter(request) {
    if (!request.meta) {
      return this.get(request);
    }

    return new Promise((resolve, reject) => {
      let start = request.meta.pageNum * request.meta.perPage;
      let end = (request.meta.pageNum + 1) * request.meta.perPage;
      let collection = _.get(this._db, request.url);
      let result = collection.slice(start, end);

      if (_.isEmpty(result)) {
        reject({
          driverError: 'Item not found',
          request,
        });
      }
      else {
        resolve({
          body: result,
          driverResponse: result,
          request,
        });
      }
    });
  }

  set(request) {
    return new Promise((resolve) => {
      _.set(this._db, request.url, request.payload);
      resolve({
        body: request.payload,
        driverResponse: request.payload,
        request,
      });
    });
  }

  create(request) {
    return new Promise((resolve) => {
      var collection = _.get(this._db, request.url);
      var primaryId = 0;

      // create new collection if need
      if (_.isUndefined(collection)) {
        collection = [];
        _.set(this._db, request.url, collection);
      }

      if (_.isNumber(request.payload[request.primaryKeyName])) {
        // use id from payload
        primaryId = request.payload[request.primaryKeyName];
      }
      if (!_.isEmpty(collection)) {
        // increment primary id if it isn't first element in collection
        primaryId = _.last(collection)[request.primaryKeyName] + 1;
      }

      var newValue = {
        ...request.payload,
        [request.primaryKeyName]: primaryId,
      };

      // add item to existent collection
      collection[primaryId] = newValue;

      resolve({
        body: newValue,
        driverResponse: newValue,
        request,
      });
    });
  }

  delete(request) {
    return new Promise((resolve, reject) => {
      var collection = _.get(this._db, request.url);

      if (!collection) {
        reject({
          driverError: 'Collection not found',
        });
        return;
      }

      var item = _.find(collection, {[request.primaryKeyName]: request.payload[request.primaryKeyName]});
      if (!item || !_.isNumber(item[request.primaryKeyName])) {
        // TODO: поидее не нужно. Либо возвращать new Error()
        reject({
          driverError: 'Item not found',
          request,
        });
        return;
      }

      _.remove(collection, item);

      resolve({
        body: item,
        driverResponse: item,
        request,
      });
    });
  }

  startRequest(request) {
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
   * Get instance
   * @param {object} instanceConfig
   * @returns {LocalMemory}
   */
  this.instance = (instanceConfig) => {
    return new LocalMemory(this.driverConfig, instanceConfig, this.db);
  };

  /**
   * Schema helper
   * @param {object} instanceConfig
   * @param {object} schema
   * @returns {{driver: LocalMemory, schema: *}}
   */
  this.schema = (instanceConfig, schema) => {
    // TODO: не нужно
    return {
      driver: new LocalMemory(this.driverConfig, instanceConfig, this.db),
      schema: schema,
    }
  }
}
