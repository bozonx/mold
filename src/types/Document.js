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

  $init(root) {
    this._root = root;

    this._mold = this._main.$$state.initResponse(this._root, {});
  }

  child(path) {
    // TODO: ???
    // !!! пока не разрешаем получать потомков, так как придется мого переделывать если
    //     потомки будут коллекциями
  }

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._root);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._root, params);
  }

  update(newState) {
    this._lastChanges = correctUpdatePayload(this._lastChanges, newState);
    // TODO: формировать правильно url
    this._main.$$state.updateResponse(this._root, _.cloneDeep(newState));
  }

  /**
   * Load data from driver.
   * @returns {Promise}
   */
  load() {
    let metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
        'get', this._root, undefined, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data

      // TODO: формировать правильно url
      this._main.$$state.updateResponse(this._root, resp.body);
      // TODO: не надо здесь устанавливать mold - он уже должен был установлен
      this._mold = this._main.$$state.getResponse(this._root);
      this._lastChanges = {};

      return resp;
    });
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  put() {
    let metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
        'put', this._root, this._mold, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.updateResponse(this._root, resp.body);
      this._lastChanges = {};

      return resp;
    });
  }

  /**
   * Save actual state.
   * @returns {Promise}
   */
  patch() {
    let metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
      'patch', this._root, this._lastChanges, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.updateResponse(this._root, resp.body);
      this._lastChanges = {};

      return resp;
    });
  }

}
