const _ = require('lodash');
const Mold = require('./Mold');

// TODO: test unsaveble
// TODO: test event after pending is completed


module.exports = class Action {
  constructor(
    main,
    nodeInstance,
    moldPath,
    actionName,
    primitiveSchema,
    actionParams,
    defaultUrlParams,
    defaultDriverParams
  ) {
    this._main = main;
    this.$storage = main.storage;
    // TODO: передавать в кастомный request и transform
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._primitiveSchema = primitiveSchema;
    this._actionParams = actionParams;
    this._defaultUrlParams = defaultUrlParams;
    this._defaultDriverParams = defaultDriverParams;
  }

  get pending() {
    return this._getMeta('pending') || false;
  }

  get lastError() {
    return this._getMeta('lastError');
  }

  get mold() {
    return this._mold.state;
  }

  get lastRequestParams() {
    return this._getMeta('lastRequestParams');
  }

  init() {
    this._mold = new Mold(this._main, this._moldPath, this._actionName, this._primitiveSchema);
    this._mold.init();

    this._schemaDriverParams = _.omit(this._actionParams, [
      'url',
      'transform',
      'request',
    ]);
  }

  setSilent(data) {
    return this._mold.setSilent(data);
  }

  update(partialData) {
    return this._mold.update(partialData);
  }

  updateSilent(partialData) {
    return this._mold.updateSilent(partialData);
  }

  // clearStateLayer() {
  //   // TODO: разве не через молд надо делать?
  //   // TODO: нужно все очистить или только то что должно быть замененно с сервера?
  //   this._main.storage.clearStateLayer(this._moldPath, this._actionName);
  // }

  setSolidLayer(newData) {
    this._main.storage.setSolidLayer(this._moldPath, this._actionName, newData);
  }

  onChange(handler) {
    this._mold.onChange(handler);
  }

  onAnyChange(handler) {
    this._mold.onAnyChange(handler);
  }

  off(eventName, handler) {
    this._mold.off(eventName, handler);
  }

  clear() {
    this._mold.clear();
  }

  destroy() {
    this._mold.destroy();
  }

  request(requestParams) {
    const params = this._generateParams(requestParams);

    this._updateMeta({
      pending: true,
      lastError: null,
      lastRequestParams: params,
    });

    return this._doRequest(params)
      // proceed and transform response
      .then((rawResp) => {
        this._updateMeta({ pending: false });

        return this._proceedResponse(requestParams.transform, rawResp);
      })
      .catch((err) => {
        this._updateMeta({
          pending: false,
          lastError: err,
        });

        return Promise.reject(err);
      });
  }

  _proceedResponse(transform, rawResp) {
    let resp = rawResp;
    // transform response if need
    if (_.isFunction(transform)) {
      resp = transform(resp);
    }

    const result = resp.body;

    // set data to solid layer
    this.setSolidLayer(result);

    return resp;
  }

  _doRequest(requestParams) {
    // TODO: подменить request переданной ф-ей если нужно


    // TODO: ??? getUrlParams
    // TODO: ??? this.schema
    return this._main.request.sendRequest(requestParams, {}, {});
  }

  _generateParams(requestParams) {
    const driverParams = {
      ...this._schemaDriverParams,
      ...this._defaultDriverParams,
      ..._.omit(requestParams, [ 'url', 'body' ]),
    };

    const urlParams = {
      ...this._defaultUrlParams,
      ...requestParams.url,
    };

    return {
      urlParams,
      driverParams,
      // TODO: убрать несохраняемые данные
      // payload: omitUnsaveable(this._mold, this.schema),
      payload: requestParams.body,
      //moldPath: this._moldPath,
    };
  }

  _getMeta(param) {
    return this._main.storage.getMeta(this._moldPath, this._actionName, param);
  }

  _updateMeta(partialData) {
    this._main.storage.updateMeta(this._moldPath, this._actionName, partialData);
  }

};
