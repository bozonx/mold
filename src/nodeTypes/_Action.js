import _Mold from './_Mold';


export default class Action {
  constructor(main, nodeInstance, moldPath, actionName, fullSchema) {
    this._storage = main.$$storage;
    this._request = main.$$request;
    this._typeManager = main.$$typeManager;
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._schema = fullSchema;
    this.responseTransformCb = null;

    this._mold = new _Mold(this._storage, this._moldPath, this._actionName, this._schema);
  }

  get pending() {
    return this._getMeta('pending') || false;
  }

  get mold() {
    return this._mold.state;
  }

  init() {
    this._mold.init();
  }

  getDriverParams() {
    return this._getMeta('driverParams');
  }

  setDriverParams(driverParams) {
    this._updateMeta({ driverParams });
  }

  update(partialData) {
    return this._mold.update(partialData);
  }

  updateSilent(partialData) {
    return this._mold.updateSilent(partialData);
  }

  request(payload) {
    this._updateMeta({ pending: true });
    const driverRequestParams = this.getDriverParams();

    return this._doRequest(driverRequestParams, payload)
      .then((resp) => {
        let result = resp.body;
        if (this.responseTransformCb) {
          result = this.responseTransformCb(resp);
        }

        this._updateMeta({ pending: false });
        this._storage.setBottomLevel(this._moldPath, this._actionName, result);

        return resp;
      })
      .catch((err) => {
        this._updateMeta({ pending: false });

        return Promise.reject(err);
      });
  }

  _getMeta(param) {
    return this._storage.getMeta(this._moldPath, this._actionName, param);
  }

  _updateMeta(partialData) {
    this._storage.updateMeta(this._moldPath, this._actionName, partialData);
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
    return this._request.sendRequest(request, {}, {});
  }

}
