import _ from 'lodash';

import { findPrimary, convertFromLodashToUrl } from './helpers';

export default class Request {
  constructor(main) {
    this._main = main;
  }

  /**
   * Send request to driver
   * @param {string} method - one of: get, put, patch, filter, create, delete
   * @param {string} moldPath - path in mold
   * @param {string} schema
   * @param {object|undefined} options - raw params to request which do driver.
   * @param {object|array|undefined} payload - data to save
   * @param {object|undefined} metaParams - parameters to pass to driver
   * @param {object|undefined} urlParams
   * @returns {Promise}
   */
  sendRequest(method, moldPath, schema, payload, options, metaParams, urlParams) {
    const promise = this._startDriverRequest(method, moldPath, schema, payload, options, metaParams, urlParams)
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
   * @param {string} method - one of: get, set, filter, create, delete
   * @param {string} moldPath - path in mold
   * @param {string} schema
   * @param {*} [payload] - data to save
   * @param {object|undefined} options
   * @param {object|undefined} metaParams
   * @param {object} urlParams - dynamic part of source path
   * @returns {Promise}
   * @private
   */
  _startDriverRequest(method, moldPath, schema, payload, options, metaParams, urlParams) {
    const driverRoot = this._main.$$schemaManager.getClosestDriverPath(moldPath);

    const driver = this._main.$$schemaManager.getDriver(driverRoot);
    // // It rise an error if path doesn't consist with schema
    // const schema = this._main.$$schemaManager.get(schemaPath);

    const req = this._generateRequest(method, moldPath, schema, payload, driverRoot, options, metaParams, urlParams);
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
