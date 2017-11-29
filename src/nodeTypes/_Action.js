import _Mold from './_Mold';

export default class Action {
  constructor(stateManager, nodeInstance, moldPath, actionName, schema) {
    this._stateManager = stateManager;
    this._nodeInstance = nodeInstance;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._schema = schema;
    this.responseTransformCb = null;

    this._mold = new _Mold(this._stateManager, this._moldPath, this._actionName, this._schema);
  }

  get pending() {
    return this._stateManager.getMeta(this._moldPath, this._actionName, 'pending') || false;
  }

  get mold() {
    return this._stateManager.getState(this._moldPath, this._actionName);
  }

  init(actionStateRootContainer) {
    this._stateManager.initState(this._moldPath, this._actionName, actionStateRootContainer);
  }

  getDriverParams() {
    return this._stateManager.getMeta(this._moldPath, this._actionName, 'driverParams');
  }

  setDriverParams(driverParams) {
    this._stateManager.updateMeta(this._moldPath, this._actionName, { driverParams });
  }

  update(partialData) {
    return this._stateManager.updateTopLevel(this._moldPath, this._actionName, partialData);
  }

  updateSilent(partialData) {
    return this._stateManager.updateTopLevelSilent(this._moldPath, this._actionName, partialData);
  }

  request(payload) {
    this._stateManager.updateMeta(this._moldPath, this._actionName, { pending: true });
    const driverRequestParams = this.getDriverParams();

    return this._doRequest(driverRequestParams, payload)
      .then((resp) => {
        let result = resp.body;
        if (this.responseTransformCb) {
          result = this.responseTransformCb(resp);
        }

        this._stateManager.updateMeta(this._moldPath, this._actionName, { pending: false });
        this._stateManager.setBottomLevel(this._moldPath, this._actionName, result);

        return resp;
      })
      .catch((err) => {
        this._stateManager.updateMeta(this._moldPath, this._actionName, { pending: false });

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
