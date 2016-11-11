import _ from 'lodash';

import { findPrimary, getSchemaBaseType } from './helpers';

export default class Request {
  constructor(main, storage) {
    this._main = main;
    this._storage = storage;
  }

  /**
   * Load container and it's contents from driver.
   * @param {string} pathToContainer
   * @param {object|null} urlParams - dynamic part of source path
   * @returns {Promise}
   */
  loadDocument(pathToContainer, urlParams) {
    return this._startDriverRequest('get', pathToContainer, undefined, urlParams)
      .then(this._successHandler.bind(this), this._errorHandler.bind(this));
  }

  /**
   * Load list of documents from driver.
   * @param {string} pathToCollection
   * @param {object|null} urlParams - dynamic part of source path
   * @returns {Promise}
   */
  loadDocumentsCollection(pathToCollection, urlParams) {
    return this._startDriverRequest('filter', pathToCollection, undefined, urlParams)
      .then((resp) => {
        this._main.$$log.info('---> finish request: ', resp);
        return resp;
      }, this._errorHandler.bind(this));
  }

  /**
   * Save container and it's contents to driver.
   * @param {string} pathToContainer
   * @param {object|null} urlParams - dynamic part of source path
   * @param {object} actualMold - actual data by path
   * @returns {Promise}
   */
  saveDocument(pathToContainer, urlParams, actualMold) {
    return this._startDriverRequest('set', pathToContainer, actualMold, urlParams)
      .then(this._successHandler.bind(this), this._errorHandler.bind(this));
  }

  /**
   * Create document
   * @param {string} pathToDocumentsCollection
   * @param {object|null} urlParams - dynamic part of source path
   * @param {object} document
   */
  createDocument(pathToDocumentsCollection, urlParams, document) {
    return this._startDriverRequest('create', pathToDocumentsCollection, document, urlParams)
      .then((resp) => {
        this._main.$$log.info('---> finish request: ', resp);
        // update mold with server response data
        // TODO: обновить сам элемент. Поправить тест
        //this._storage.update(resp.request.storagePath, resp.body);

        return resp;
      }, this._errorHandler.bind(this));
  }

  /**
   * Delete document and remove it from mold
   * @param {string} pathToDocumentsCollection
   * @param {object|null} urlParams - dynamic part of source path
   * @param {object} document
   */
  deleteDocument(pathToDocumentsCollection, urlParams, document) {
    return this._startDriverRequest('delete', pathToDocumentsCollection, document, urlParams)
      .then((resp) => {
        this._main.$$log.info('---> finish request: ', resp);
        // update mold with server response data
        // TODO: удалить элемент
        //this._storage.update(resp.request.storagePath, resp.body);
        return resp;
      }, this._errorHandler.bind(this));
  }

  /**
   * Send query to driver for data.
   * @param {string} method - one of: get, set, filter, create, delete
   * @param {string} storagePath - path in mold or schena
   * @param {*} [payload] - data to save
   * @param {object} urlParams - dynamic part of source path
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(method, storagePath, payload, urlParams) {
    var driver = this._main.$$schemaManager.getDriver(storagePath);
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(storagePath);

    var req = this._generateRequest(method, storagePath, payload, urlParams, schema);
    this._main.$$log.info('---> start request: ', req);

    return driver.startRequest(req);
  }

  _generateRequest(method, storagePath, rawPayload, urlParams, schema) {
    let payload = rawPayload;
    if (_.isPlainObject(payload)) {
      payload = _.omit(_.cloneDeep(payload), '$index', '$adding', '$addedUnsaved', '$deleting');
      payload = _.omitBy(payload, _.isUndefined);
    }
    // it clears an empty array or objects
    payload = (_.isEmpty(payload)) ? undefined : payload;
    // Payload can't be other type then array or plainObject

    var request = {
      method,
      payload,
      storagePath,
      url: this._prepareUrl(storagePath, schema.source, urlParams),
      primaryKeyName: schema.item && findPrimary(schema.item),
      // One of: container or collection
      nodeType: getSchemaBaseType(schema.type),
      // TODO: params - доп параметры, передаваемые драйверу - или воткнуть их в payload
      //params: undefined,
    };
    // clear undefined params
    return _.omitBy(request, _.isUndefined);
  }

  _prepareUrl(storagePath, urlTemplate, urlTemplateParams) {
    if (!urlTemplate) return storagePath;

    return _.template(urlTemplate)(urlTemplateParams);
  }

  _successHandler(resp) {
    this._main.$$log.info('---> finish request: ', resp);
    // update mold with server response data
    this._storage.update(resp.request.storagePath, resp.body);
    return resp;
  }

  _errorHandler(err) {
    this._main.$$log.error('---> ERROR: failed request: ', err);
    return err;
  }

}
