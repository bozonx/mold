import _Mold from './_Mold';

export default class Action {
  constructor(stateManager, nodeInstance, moldPath, actionName, fullSchema) {
    this._stateManager = stateManager;
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._schema = fullSchema;
    this.responseTransformCb = null;

    this._mold = new _Mold(this._stateManager, this._moldPath, this._actionName, this._schema);
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
    return this._stateManager.updateTopLevel(this._moldPath, this._actionName, partialData);
  }

  updateSilent(partialData) {
    return this._stateManager.updateTopLevelSilent(this._moldPath, this._actionName, partialData);
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
        this._stateManager.setBottomLevel(this._moldPath, this._actionName, result);

        return resp;
      })
      .catch((err) => {
        this._updateMeta({ pending: false });

        return Promise.reject(err);
      });
  }

  _getMeta(param) {
    return this._stateManager.getMeta(this._moldPath, this._actionName, param);
  }

  _updateMeta(partialData) {
    this._stateManager.updateMeta(this._moldPath, this._actionName, partialData);
  }

  _doRequest(driverRequestParams, payload) {
    const request = {
      ...driverRequestParams,
      //method: driverRequestParams.method,
      moldPath: this._moldPath,
      // TODO: WTF???
      //payload: omitUnsaveable(this._mold, this.schema),
      payload: payload,
    };

    // TODO: ??? getUrlParams
    // TODO: ??? this.schema
    return this._stateManager.$$request.sendRequest(request, {}, {});
  }

}
