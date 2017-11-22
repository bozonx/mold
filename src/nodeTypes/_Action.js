export default class Action {
  constructor(stateManager, nodeInstance, moldPath, actionName) {
    this._stateManager = stateManager;
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
    // You have to set driver params like method etc
    this.driverParams = null;
    this.responseTransformCb = null;
  }

  get pending() {
    return this._stateManager.getMeta(this._moldPath, 'pending', this._actionName) || false;
  }

  get mold() {
    return this._stateManager.getState(this._moldPath, this._actionName);
  }

  init() {
  }

  getDriverParams() {
    return this._stateManager.getMeta(this._moldPath, 'driverParams', this._actionName);
  }

  setDriverParams(driverParams) {
    this._stateManager.updateMeta(this._moldPath, { driverParams }, this._actionName);
  }

  update(partialData) {
    return this._stateManager.updateTopLevel(this._moldPath, partialData, this._actionName);
  }

  updateSilent(partialData) {
    return this._stateManager.updateTopLevelSilent(this._moldPath, partialData, this._actionName);
  }

  request(payload) {
    this._stateManager.updateMeta(this._moldPath, { pending: true }, this._actionName);
    const driverRequestParams = this.getDriverParams();

    return this._doRequest(driverRequestParams, payload)
      .then((resp) => {
        let result = resp.body;
        if (this.responseTransformCb) {
          result = this.responseTransformCb(resp);
        }

        this._stateManager.updateMeta(this._moldPath, { pending: false }, this._actionName);
        this._stateManager.setBottomLevel(this._moldPath, result, this._actionName);

        return resp;
      })
      .catch((err) => {
        this._stateManager.updateMeta(this._moldPath, { pending: false }, this._actionName);

        return Promise.reject(err);
      });
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
