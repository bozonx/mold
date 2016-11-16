import _ from 'lodash';

import { findPrimary, getSchemaBaseType, convertFromLodashToUrl } from './helpers';

export default class Request {
  constructor(main) {
    this._main = main;
  }

  /**
   * Send request to driver
   * @param {string} method - one of: get, put, patch, filter, create, delete
   * @param {string} moldPath - path in mold
   * @param {object|array|undefined} payload - data to save
   * @param {object|undefined} metaParams - parameters to pass to driver
   * @param {object|undefined} urlParams
   * @returns {Promise}
   */
  sendRequest(method, moldPath, payload, metaParams, urlParams) {
    return this._startDriverRequest(method, moldPath, payload, urlParams, metaParams)
      .then(this._successHandler.bind(this), this._errorHandler.bind(this));
  }

  /**
   * Send query to driver for data.
   * @param {string} method - one of: get, set, filter, create, delete
   * @param {string} storagePath - path in mold or schena
   * @param {*} [payload] - data to save
   * @param {object} urlParams - dynamic part of source path
   * @param {object|undefined} metaParams
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(method, storagePath, payload, urlParams, metaParams) {
    const driverRoot = this._main.$$schemaManager.getClosestDriverPath(storagePath);

    const driver = this._main.$$schemaManager.getDriver(driverRoot);
    // It rise an error if path doesn't consist with schema
    const schema = this._main.$$schemaManager.get(storagePath);

    const req = this._generateRequest(method, storagePath, payload, urlParams, schema, driverRoot, metaParams);
    this._main.$$log.info('---> start request: ', req);

    return driver.startRequest(req);
  }

  _generateRequest(method, storagePath, rawPayload, urlParams, schema, driverRoot, meta) {
    // TODO: refactor
    let payload = rawPayload;
    if (_.isPlainObject(payload)) {
      payload = _.omit(_.cloneDeep(payload), '$index', '$pageIndex', '$adding', '$addedUnsaved', '$deleting');
      payload = _.omitBy(payload, _.isUndefined);
    }
    // it clears an empty array or objects
    payload = (_.isEmpty(payload)) ? undefined : payload;
    // Payload can't be other type then array or plainObject

    const request = {
      method,
      payload,
      storagePath,
      driverRoot,
      meta,
      url: '',
      primaryKeyName: schema.item && findPrimary(schema.item),
      // One of: container or collection
      nodeType: getSchemaBaseType(schema.type),
      // TODO: params - доп параметры, передаваемые драйверу - или воткнуть их в payload
      //params: undefined,
    };
    request.url = this._prepareUrl(schema.source, urlParams, request, driverRoot);

    // clear undefined params
    return _.omitBy(request, _.isUndefined);
  }

  _prepareUrl(urlTemplate, urlTemplateParams, request, driverRoot) {
    if (urlTemplate) return _.template(urlTemplate)({...urlTemplateParams, request});

    let defaultUrl = _.trimStart(request.storagePath, driverRoot);
    defaultUrl = convertFromLodashToUrl(defaultUrl);

    return defaultUrl;
  }

  _successHandler(resp) {
    this._main.$$log.info('---> finish request: ', resp);
    return resp;
  }

  _errorHandler(err) {
    this._main.$$log.error('---> ERROR: failed request: ', err);
    return err;
  }

}
