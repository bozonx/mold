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
      .then((resp) => {
        this._main.$$log.info('---> finish request: ', resp);
        return resp;
      }, this._errorHandler.bind(this));
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
   * Create document
   * @param {string} pathToDocumentsCollection
   * @param {object|null} sourceParams - dynamic part of source path
   * @param {object} document
   */
  createDocument(pathToDocumentsCollection, sourceParams, document) {
    return this._startDriverRequest('create', pathToDocumentsCollection, document, sourceParams)
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
   * @param {object|null} sourceParams - dynamic part of source path
   * @param {object} document
   */
  deleteDocument(pathToDocumentsCollection, sourceParams, document) {
    return this._startDriverRequest('delete', pathToDocumentsCollection, document, sourceParams)
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
   * @param {object} sourceParams - dynamic part of source path
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(method, storagePath, payload, sourceParams) {
    var driver = this._main.$$schemaManager.getDriver(storagePath);
    // It rise an error if path doesn't consist with schema
    var schema = this._main.$$schemaManager.get(storagePath);

    var req = this._generateRequest(method, storagePath, payload, sourceParams, schema);
    this._main.$$log.info('---> start request: ', req);

    return driver.startRequest(req);
  }

  _generateRequest(method, storagePath, rawPayload, sourceParams, schema) {
    var payload = rawPayload;
    if (_.isPlainObject(payload)) {
      payload = _.omit(_.cloneDeep(payload), '$index', '$adding', '$addedUnsaved', '$deletting');
      payload = _.omitBy(payload, _.isUndefined);
    }
    // it clears an empty array or objects
    payload = (_.isEmpty(payload)) ? undefined : payload;
    // Payload can't be other type then array or plainObject

    // TODO: !!!! pathToDocument не надо - он всегда = storagePath
    // TODO: надо добавить ещё document params
    var documentParams = _.omitBy({
      source: schema.source,
      pathToDocument: storagePath,
    }, _.isUndefined);

    var request = {
      method,
      storagePath,
      // TODO: url - сформированный url с подставленными параметрами
      //url: this._convertToSource(storagePath, schema.source, sourceParams),
      payload: payload,
      primaryKeyName: schema.item && findPrimary(schema.item),
      nodeType: getSchemaBaseType(schema.type),
      // TODO: add params - доп параметры, передаваемые драйверу - или воткнуть их в payload

      // TODO: убрать
      document: documentParams,
      // TODO: убрать
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
