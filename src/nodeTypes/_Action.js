export default class Action {
  constructor(stateManager, nodeInstance, moldPath, actionName) {
    this._stateManager = stateManager;
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
  }

  init() {

  }

  isPending() {
    return this._stateManager.getMeta(this._moldPath, 'pending', this._actionName);
  }

  update(partialData) {
    return this._stateManager.updateTopLevel(this._moldPath, partialData, this._actionName);
  }

  updateSilent(partialData) {
    return this._stateManager.updateTopLevelSilent(this._moldPath, partialData, this._actionName);
  }

  request(method, driverRequestParams, payload) {
    this._stateManager.updateMeta(this._moldPath, { pending: true }, this._actionName);

    return this._doRequest(method, driverRequestParams, payload)
      .then((resp) => {
        this._stateManager.updateMeta(this._moldPath, { pending: false }, this._actionName);

        return resp;
      })
      .catch((err) => {
        this._stateManager.updateMeta(this._moldPath, { pending: false }, this._actionName);

        return Promise.reject(err);
      });
  }

  _doRequest(method, driverRequestParams, payload) {
    const request = _.defaultsDeep({
      method,
      moldPath: this._moldPath,
      // TODO: WTF???
      //payload: omitUnsaveable(this._mold, this.schema),
      payload: payload,
    }, driverRequestParams);

    // TODO: ??? getUrlParams
    // TODO: ??? this.schema
    return this._stateManager.$$request.sendRequest(request, {}, {});
  }

}
