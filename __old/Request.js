import _ from 'lodash';

import { findPrimary, getSchemaBaseType } from './helpers';

export default class Request {
  constructor(main, storage, saveBuffer) {
    this._main = main;
    this._storage = storage;
    this._saveBuffer = saveBuffer;
  }

  /**
   * Load container and it's contents from driver.
   * @param {string} pathToContainer
   * @param {object|null} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  loadDocument(pathToContainer, sourceParams) {
    return this._startDriverRequest('get', pathToContainer, undefined, sourceParams)
      .then(this._successHandler.bind(this), this._errorHandler.bind(this));
  }

  /**
   * Load list of documents from driver.
   * @param {string} pathToCollection
   * @param {object|null} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  loadDocumentsCollection(pathToCollection, sourceParams) {
    return this._startDriverRequest('filter', pathToCollection, undefined, sourceParams)
      .then(this._successHandler.bind(this), this._errorHandler.bind(this));
  }

  /**
   * Save container and it's contents to driver.
   * @param {string} pathToContainer
   * @param {object|null} sourceParams - dynamic part of source path
   * @param {object} actualMold - actual data by path
   * @returns {Promise}
   */
  saveDocument(pathToContainer, sourceParams, actualMold) {
    return this._startDriverRequest('set', pathToContainer, actualMold, sourceParams)
      .then(this._successHandler.bind(this), this._errorHandler.bind(this));
  }

  /**
   * Add new item to mold
   * @param {string} pathToDocumentsCollection
   * @param {object|null} sourceParams - dynamic part of source path
   * @param {object} document
   */
  addDocument(pathToDocumentsCollection, sourceParams, document) {

  }

  /**
   * Save unsaved, removed or added items to driver.
   * @param {string} pathToCollection
   * @param {object|null} sourceParams - dynamic part of source path
   * @returns {Promise}
   */
  saveDocumetsCollection(pathToCollection, sourceParams) {
    var promises = [
      ...this._saveUnsaved(this._saveBuffer.getAdded(), pathToCollection, 'add', sourceParams, (unsavedItem, resp) => {
        // update item from mold with server response data
        _.extend(unsavedItem, resp.coocked);
      }),
      ...this._saveUnsaved(this._saveBuffer.getRemoved(), pathToCollection, 'remove', sourceParams),
    ];

    return Promise.all(promises).then((results) => {
      this._main.log.info('---> finish save collection: ', results);
      return results;
    });


    // return new Promise((mainResolve) => {
    //   var promises = [
    //     ...this._saveUnsaved(this._saveBuffer.getAdded(), pathToCollection, 'add', sourceParams, (unsavedItem, resp) => {
    //       // update item from mold with server response data
    //       _.extend(unsavedItem, resp.coocked);
    //     }),
    //     ...this._saveUnsaved(this._saveBuffer.getRemoved(), pathToCollection, 'remove', sourceParams),
    //   ];
    //
    //   Promise.all(promises).then((results) => {
    //     this._main.log.info('---> finish save collection: ', results);
    //     mainResolve(results);
    //   });
    // });
  }

  _saveUnsaved(unsavedList, pathToCollection, method, sourceParams, successCb) {
    var promises = [];

    _.each(_.reverse(unsavedList[pathToCollection]), (unsavedItem) => {
      // skip empty
      if (!unsavedItem) return;

      this._saveBuffer.removeUnsavedItem(pathToCollection, unsavedItem, method);

      promises.push(new Promise((resolve) => {
        this._startDriverRequest(method, pathToCollection, unsavedItem, sourceParams)
          .then((resp) => {
            if (successCb) successCb(unsavedItem, resp);

            // remove $addedUnsaved prop from saved item
            delete unsavedItem.$addedUnsaved;

            resolve({
              path: pathToCollection,
              isOk: true,
              resp,
            });
          }, (driverError) => {
            // on error make item unsaved again
            if (_.isUndefined(unsavedList[pathToCollection])) unsavedList[pathToCollection] = [];
            unsavedList[pathToCollection].push(unsavedItem);

            resolve({
              path: pathToCollection,
              isOk: false,
              driverError,
            });
          });
      }));
    });

    return promises;
  }

  /**
   * Send query to driver for data.
   * @param {string} method - one of: get, set, filter, add, remove
   * @param {string} storagePath - path in mold or schena
   * @param {*} [payload] - data to save
   * @param {object} sourceParams - dynamic part of source path
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(method, storagePath, payload, sourceParams) {
    var driver = this._main.schemaManager.getDriver(storagePath);
    // It rise an error if path doesn't consist with schema
    var schema = this._main.schemaManager.get(storagePath);

    var req = this._generateRequest(method, storagePath, payload, sourceParams, schema);
    this._main.log.info('---> start request: ', req);

    return driver.startRequest(req);
  }

  _generateRequest(method, storagePath, rawPayload, sourceParams, schema) {
    var payload = rawPayload;
    if (_.isPlainObject(payload)) {
      payload = _.omit(_.cloneDeep(payload), '$index', '$addedUnsaved');
      payload = _.omitBy(payload, _.isUndefined);
    }
    // it clears an empty array or objects
    payload = (_.isEmpty(payload)) ? undefined : payload;
    // Payload can't be other type then array or plainObject

    // TODO: !!!! pathToDocument не надо - он всегда = storagePath
    // TODO: надо добавить ещё document params
    var documentParams = {
      source: schema.source,
      pathToDocument: storagePath,
    };

    var request = {
      method,
      storagePath,
      payload: payload,
      primaryKeyName: schema.item && findPrimary(schema.item),
      schemaBaseType: getSchemaBaseType(schema.type),
      document: documentParams,
      driverPath: {
        // path to document
        document: this._convertToSource(documentParams.pathToDocument, documentParams.source, sourceParams),
        full: (documentParams) ? this._convertToSource(storagePath, documentParams.source, sourceParams) : storagePath,
        // TODO: не правильно работает если брать элемент коллекции
        // base: splits && splits.basePath,
        // sub: splits && splits.paramPath,
      },
    };
    // clear undefined params
    return _.omitBy(request, _.isUndefined);
  }

  _convertToSource(pathInSchema, realSource, sourceParams) {
    if (!realSource) return pathInSchema;

    return _.template(realSource)(sourceParams);
  }

  _successHandler(resp) {
    this._main.log.info('---> finish request: ', resp);
    // update mold with server response data
    this._storage.update(resp.request.storagePath, resp.coocked);
    return resp;
  }

  _errorHandler(err) {
    this._main.log.error('---> ERROR: failed request: ', err);
    return err;
  }

}
