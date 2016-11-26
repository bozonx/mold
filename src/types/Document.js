import _ from 'lodash';

import { correctUpdatePayload } from '../helpers';
import Container from './Container';

export default class Document extends Container{
  constructor(main) {
    super(main);

    this._lastChanges = {};
  }

  get type() {
    return 'document';
  }

  /**
   * Get changes from last save to the moment.
   * @returns {object}
   */
  get lastChanges() {
    return this._lastChanges;
  }

  $init(moldPath) {
    this._storagePath = this._moldPath;
    this._moldPath = moldPath;

    this._mold = this._main.$$state.initResponse(this._moldPath, {});
  }

  child(path) {
    // TODO: ???
    // !!! пока не разрешаем получать потомков, так как придется мого переделывать если
    //     потомки будут коллекциями
  }

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._moldPath);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._moldPath, params);
  }

  update(newState) {
    this._lastChanges = correctUpdatePayload(this._lastChanges, newState);
    // TODO: формировать правильно url
    this._main.$$state.updateResponse(this._moldPath, _.cloneDeep(newState));
  }

  /**
   * Load data from driver.
   * @returns {Promise}
   */
  load() {
    const metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
        'get', this._moldPath, undefined, metaParams, this.getUrlParams())
      .then((resp) => {
        // update mold with server response data

        // TODO: формировать правильно url
        this._main.$$state.updateResponse(this._moldPath, resp.body);
        // TODO: не надо здесь устанавливать mold - он уже должен был установлен
        this._mold = this._main.$$state.getResponse(this._moldPath);
        this._lastChanges = {};

        return resp;
      });
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  put() {
    const metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
        'put', this._moldPath, this._mold, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.updateResponse(this._moldPath, resp.body);
      this._lastChanges = {};

      return resp;
    });
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  patch() {
    const metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
      'patch', this._moldPath, this._lastChanges, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.updateResponse(this._moldPath, resp.body);
      this._lastChanges = {};

      return resp;
    });
  }

}
