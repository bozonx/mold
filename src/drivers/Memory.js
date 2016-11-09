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
      console.log(1111, request)
      var resp = _.get(this._db, request.driverPath.full);
      if (!_.isUndefined(resp)) {
        resolve({
          coocked: resp,
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
    return this.get(request);
  }

  set(request) {
    return new Promise((resolve) => {
      _.set(this._db, request.driverPath.full, request.payload);
      resolve({
        coocked: request.payload,
        driverResponse: request.payload,
        request,
      });
    });
  }

  add(request) {
    return new Promise((resolve) => {
      var collection = _.get(this._db, request.driverPath.full);
      var primaryId = 0;

      // create new collection if need
      if (_.isUndefined(collection)) {
        collection = [];
        _.set(this._db, request.driverPath.full, collection);
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
        coocked: newValue,
        driverResponse: newValue,
        request,
      });
    });
  }

  remove(request) {
    return new Promise((resolve, reject) => {
      var collection = _.get(this._db, request.driverPath.full);

      if (!collection) {
        reject({
          driverError: 'Collection not found',
        });
        return;
      }

      var item = _.find(collection, {[request.primaryKeyName]: request.payload[request.primaryKeyName]});
      if (!item || !_.isNumber(item[request.primaryKeyName])) {
        reject({
          driverError: 'Item not found',
          request,
        });
        return;
      }

      _.remove(collection, item);

      resolve({
        coocked: item,
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
