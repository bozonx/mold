import _ from 'lodash';

import { correctUpdatePayload } from '../helpers';

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
      var resp = _.get(this._db, this._convertToLodash(request.url));
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
    if (!request.meta || !_.isNumber(request.meta.perPage) || !_.isNumber(request.meta.pageNum)) {
      return this.get(request);
    }

    return new Promise((resolve, reject) => {
      let start = request.meta.pageNum * request.meta.perPage;
      let end = (request.meta.pageNum + 1) * request.meta.perPage;
      let collection = _.get(this._db, this._convertToLodash(request.url));
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

  /**
   * It set new data or create a document.
   * @param request
   * @returns {Promise}
   */
  put(request) {
    return new Promise((resolve) => {
      _.set(this._db, this._convertToLodash(request.url), request.payload);
      resolve({
        body: request.payload,
        driverResponse: request.payload,
        request,
      });
    });
  }

  /**
   * It patches existent document.
   * If document doesn't exist it rises an error.
   * @param {object} request
   * @returns {Promise}
   */
  patch(request) {
    return new Promise((resolve, reject) => {
      let document = _.get(this._db, this._convertToLodash(request.url));

      if (document) {
        let newState = correctUpdatePayload(document, request.payload);

        _.set(this._db, this._convertToLodash(request.url), newState);
        resolve({
          body: newState,
          driverResponse: request.payload,
          request,
        });
      }
      else {
        reject({
          driverError: 'Document not found',
        });
      }
    });
  }

  create(request) {
    return new Promise((resolve) => {
      let lodashPath = this._convertToLodash(request.url);
      let collection = _.get(this._db, lodashPath);
      let primaryId = 0;

      // create new collection if need
      if (_.isUndefined(collection)) {
        collection = [];
        _.set(this._db, lodashPath, collection);
      }

      // TODO: не использовать id из payload - всегда генерировать!!!!
      if (_.isNumber(request.payload[request.primaryKeyName])) {
        // use id from payload
        primaryId = request.payload[request.primaryKeyName];
      }
      if (!_.isEmpty(collection)) {
        // increment primary id if it isn't first element in collection
        primaryId = _.last(collection)[request.primaryKeyName] + 1;
      }

      // add id param
      var newValue = {
        ...request.payload,
        [request.primaryKeyName]: primaryId,
      };

      // set item to existent collection
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
      var collection = _.get(this._db, this._convertToLodash(request.url));

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

      // TODO: use splice
      _.remove(collection, item);

      resolve({
        body: undefined,
        driverResponse: item,
        request,
      });
    });
  }

  startRequest(request) {
    return this[request.method](request);
  }

  _convertToLodash(url) {
    let converted = url;
    converted = converted.replace(/\/(\d+)/g, '[$1]');
    converted = converted.replace(/\//g, '.');
    converted = _.trim(converted, '.');
    return converted;
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

}

