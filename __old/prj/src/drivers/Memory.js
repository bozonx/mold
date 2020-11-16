const _ = require('lodash');
const { correctUpdatePayload, convertFromUrlToLodash } = require('../helpers/helpers');


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
      const resp = _.get(this._db, convertFromUrlToLodash(request.url));
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

    // TODO: поддержка сортировки - desc по полю

    return new Promise((resolve, reject) => {
      const lastItemIndex = (request.meta.pageNum + 1) * request.meta.perPage;

      const start = request.meta.pageNum * request.meta.perPage;
      const end = lastItemIndex;
      const collection = _.get(this._db, convertFromUrlToLodash(request.url));
      const result = collection.slice(start, end);

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
          meta: {
            pageNum: request.meta.pageNum,
            // TODO: проверить нужно ли отнимать 1 от collection.length
            lastPage: lastItemIndex >= collection.length,
          },
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
      _.set(this._db, convertFromUrlToLodash(request.url), request.payload);
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
      const document = _.get(this._db, convertFromUrlToLodash(request.url));

      if (document) {
        const newState = correctUpdatePayload(document, request.payload);

        _.set(this._db, convertFromUrlToLodash(request.url), newState);
        resolve({
          body: newState,
          driverResponse: request.payload,
          request,
        });
      }
      else {
        reject({ driverError: 'Document not found' });
      }
    });
  }

  create(request) {
    return new Promise((resolve) => {
      const lodashPath = convertFromUrlToLodash(request.url);
      let collection = _.get(this._db, lodashPath);
      let primaryId = 0;

      // create new collection if need
      if (_.isUndefined(collection)) {
        collection = [];
        _.set(this._db, lodashPath, collection);
      }

      // increment primary id
      if (collection.length) {
        primaryId = _.last(collection).$id + 1;
      }

      // add id param
      const newValue = {
        ...request.payload,
        $id: primaryId,
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

  remove(request) {
    return new Promise((resolve, reject) => {
      const collection = _.get(this._db, convertFromUrlToLodash(request.url));

      if (!collection) {
        reject({ driverError: 'Collection not found' });

        return;
      }

      const item = _.find(collection, { $id: request.payload.$id });
      if (_.isNil(item)) {
        reject({
          driverError: 'Item not found',
          request,
        });

        return;
      }

      collection.splice(_.indexOf(collection, item), 1);

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
}

/**
 * Instance of this class creates once a mold instance
 */
module.exports = function(driverConfig) {
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

};
