import Mold from './Mold';

// TODO: test unsaveble
// TODO: test event after pending is completed

export default class ActionBase {
  constructor(main, nodeInstance, moldPath, actionName, primitiveSchema) {
    this._main = main;
    this.$storage = main.storage;
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._primitiveSchema = primitiveSchema;
  }

  get pending() {
    return this._getMeta('pending') || false;
  }

  get mold() {
    return this._mold.state;
  }

  init() {
    this._mold = new Mold(this._main, this._moldPath, this._actionName, this._primitiveSchema);
    this._mold.init();
  }

  getDriverParams() {
    return this._getMeta('driverParams');
  }

  setDriverParams(driverParams) {
    this._updateMeta({ driverParams });
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

  request(payload) {
    this._updateMeta({ pending: true });
    const driverRequestParams = this.getDriverParams();

    return this._doRequest(driverRequestParams, payload)
      .then((rawResp) => {
        let resp = rawResp;
        // transform response if need
        if (this.responseTransformCb) {
          resp = this.responseTransformCb(resp);
        }

        const result = resp.body;

        this._updateMeta({ pending: false });
        this.setSolidLayer(result);

        return resp;
      })
      .catch((err) => {
        this._updateMeta({ pending: false });

        return Promise.reject(err);
      });
  }

  _getMeta(param) {
    return this._main.storage.getMeta(this._moldPath, this._actionName, param);
  }

  _updateMeta(partialData) {
    this._main.storage.updateMeta(this._moldPath, this._actionName, partialData);
  }

  _doRequest(driverRequestParams, payload) {
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

}
