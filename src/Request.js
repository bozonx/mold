import _ from 'lodash';

import { findPrimary, convertFromLodashToUrl } from './helpers';

export default class Request {
  constructor(main) {
    this._main = main;
  }

  /**
   * Send request to driver
   * @param {string} rawRequest - method, moldPath, payload, options, metaParams
   * @param {string} schema
   * @param {object|undefined} urlParams
   * @returns {Promise}
   */
  sendRequest(rawRequest, schema, urlParams) {
    const promise = this._startDriverRequest(rawRequest, schema, urlParams);
    promise.then((resp) => {
      this._main.$$log.info('---> finish request: ', resp);
      return resp;
    }).catch((err) => {
      this._main.$$log.info('---> failed request: ', err);
      return err;
    });

    return promise;
  }

  /**
   * Send query to driver for data.
   * @param {string} rawRequest - method, moldPath, payload, options, metaParams
   * @param {string} schema
   * @param {object|undefined} urlParams
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(rawRequest, schema, urlParams) {
    const driverRoot = this._main.$$schemaManager.getClosestDriverPath(rawRequest.moldPath);

    const driver = this._main.$$schemaManager.getDriver(driverRoot);
    // // It rise an error if path doesn't consist with schema
    // const schema = this._main.$$schemaManager.get(schemaPath);

    const req = this._generateRequest(
      rawRequest.method,
      rawRequest.moldPath,
      schema,
      rawRequest.payload,
      driverRoot,
      rawRequest.options,
      rawRequest.metaParams,
      urlParams);
    this._main.$$log.info('---> start request: ', req);

    return driver.startRequest(req);
  }

  _generateRequest(method, moldPath, schema, rawPayload, driverRoot, options, meta, urlParams) {
    let payload = rawPayload;
    if (_.isPlainObject(payload)) {
      payload = _.omit(_.cloneDeep(payload), ...this._main.$$config.omitParamsToRequest);
      payload = _.omitBy(payload, _.isUndefined);
    }
    // it clears an empty array or objects
    payload = (_.isEmpty(payload)) ? undefined : payload;
    // Payload can't be other type then array or plainObject

    const request = {
      method,
      payload,
      moldPath,
      driverRoot,
      meta,
      options,
      url: '',
      //primaryKeyName: schema.item && findPrimary(schema.item),
    };
    request.url = this._prepareUrl(schema.url, urlParams, request, driverRoot);

    // clear undefined params
    return _.omitBy(request, _.isUndefined);
  }

  _prepareUrl(urlTemplate, urlTemplateParams, request, driverRoot) {
    if (urlTemplate) return _.template(urlTemplate)({...urlTemplateParams, request});

    // else generate url automatically
    let defaultUrl = _.trimStart(request.moldPath, driverRoot);
    defaultUrl = convertFromLodashToUrl(defaultUrl);

    return defaultUrl;
  }

}
