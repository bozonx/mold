const _ = require('lodash');
const Mold = require('./Mold');

// TODO: test unsaveble
// TODO: test event after pending is completed

module.exports = class ActionBase {
  constructor(main, nodeInstance, moldPath, actionName, primitiveSchema, actionParams) {
    this._main = main;
    this.$storage = main.storage;
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._primitiveSchema = primitiveSchema;
    this._actionParams = actionParams;
  }

  get pending() {
    return this._getMeta('pending') || false;
  }

  get mold() {
    return this._mold.state;
  }

  get urlParams() {
    return this._getMeta('urlParams');
  }

  get driverParams() {
    return this._getMeta('driverParams');
  }

  init() {
    this._mold = new Mold(this._main, this._moldPath, this._actionName, this._primitiveSchema);
    this._mold.init();

    const driverParams = _.omit(this._actionParams, [
      'url',
      'transform',
      'request',
    ]);
    this._updateMeta(driverParams);
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

  request(params) {
    const driverParams = {
      ...this._getMeta('driverParams'),
      ..._.omit(params, [ 'url', 'body' ]),
    };

    const payload = params.body;

    this._updateMeta({
      urlParams: params.url,
      driverParams,
    });

    this._updateMeta({ pending: true });

    return this._doRequest(driverParams, payload)
      .then((rawResp) => {

        let resp = rawResp;
        // transform response if need
        if (_.isFunction(params.transform)) {
          resp = params.transform(resp);
        }

        const result = resp.body;

        this._updateMeta({ pending: false });
        // set data to solid layer
        this.setSolidLayer(result);

        return resp;
      })
      .catch((err) => {
        this._updateMeta({ pending: false });
        // TODO: установить метку что была ошибка - потом её убрать при следующем запросе

        return Promise.reject(err);
      });
  }

  _doRequest(driverRequestParams, payload) {
    // TODO: review
    const request = {
      ...driverRequestParams,
      moldPath: this._moldPath,
      // TODO: убрать несохраняемые данные
      // payload: omitUnsaveable(this._mold, this.schema),
      payload,
    };

    // TODO: ??? getUrlParams
    // TODO: ??? this.schema
    return this._main.request.sendRequest(request, {}, {});
  }

  _getMeta(param) {
    return this._main.storage.getMeta(this._moldPath, this._actionName, param);
  }

  _updateMeta(partialData) {
    this._main.storage.updateMeta(this._moldPath, this._actionName, partialData);
  }

};
