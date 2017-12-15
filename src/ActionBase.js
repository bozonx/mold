import Mold from './Mold';

// TODO: test unsaveble
// TODO: test event after pending is completed

export default class Action {
  constructor(main, nodeInstance, moldPath, actionName, fullSchema) {
    this._main = main;
    this.$storage = main.$$storage;
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._schema = fullSchema;
  }

  get pending() {
    return this._getMeta('pending') || false;
  }

  get mold() {
    return this._mold.state;
  }

  init() {
    this._mold = new Mold(this._main, this._moldPath, this._actionName, this._schema);
    this._mold.init();
  }

  getDriverParams() {
    return this._getMeta('driverParams');
  }

  setDriverParams(driverParams) {
    this._updateMeta({ driverParams });
  }

  set(data) {
    return this._mold.set(data);
  }

  update(partialData) {
    return this._mold.update(partialData);
  }

  updateSilent(partialData) {
    return this._mold.updateSilent(partialData);
  }

  clearTopLevel() {
    this._main.$$storage.clearTopLevel(this._moldPath, this._actionName);
  }

  onChange(...params) {
    this._mold.onChange(...params);
  }

  onAnyChange(...params) {
    this._mold.onAnyChange(...params);
  }

  off(...params) {
    this._mold.off(...params);
  }

  clear() {
    this._mold.clear();
  }

  destroy() {
    return this._mold.destroy();
  }

  request(payload) {
    this._updateMeta({ pending: true });
    const driverRequestParams = this.getDriverParams();

    return this._doRequest(driverRequestParams, payload)
      .then((rawResp) => {
        let resp = rawResp;
        if (this.responseTransformCb) {
          resp = this.responseTransformCb(resp);
        }

        const result = resp.body;

        this._updateMeta({ pending: false });
        this._main.$$storage.setBottomLevel(this._moldPath, this._actionName, result);
        this.clearTopLevel();

        return resp;
      })
      .catch((err) => {
        this._updateMeta({ pending: false });

        return Promise.reject(err);
      });
  }

  _getMeta(param) {
    return this._main.$$storage.getMeta(this._moldPath, this._actionName, param);
  }

  _updateMeta(partialData) {
    this._main.$$storage.updateMeta(this._moldPath, this._actionName, partialData);
  }

  _doRequest(driverRequestParams, payload) {
    const request = {
      ...driverRequestParams,
      moldPath: this._moldPath,
      // TODO: убрать несохраняемые данные
      //payload: omitUnsaveable(this._mold, this.schema),
      payload: payload,
    };

    // TODO: ??? getUrlParams
    // TODO: ??? this.schema
    return this._main.$$request.sendRequest(request, {}, {});
  }

}
