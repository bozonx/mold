import _ from 'lodash';

import { correctUpdatePayload, convertFromMoldToDocumentStoragePath } from '../helpers';
import Container from './Container';

export default class Document extends Container{
  constructor(main) {
    super(main);

    this._lastChanges = {};
  }

  get type() {
    return 'document';
  }

  get loading() {
    return this.mold.$loading;
  }

  get saving() {
    return this.mold.$saving;
  }

  /**
   * Get changes from last save to the moment.
   * @returns {object}
   */
  get lastChanges() {
    return this._lastChanges;
  }

  $init(moldPath) {
    this._storagePath = convertFromMoldToDocumentStoragePath(moldPath);
    // init a document
    if (!_.isPlainObject(this._main.$$state.getMold(this._storagePath))) {
      this._main.$$state.setSilent(this._storagePath, {});
    }
    super.$init(moldPath);
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
    this._main.$$state.update(this._moldPath, this._storagePath, _.cloneDeep(newState));
  }

  /**
   * Load data from driver.
   * @returns {Promise}
   */
  load() {
    const metaParams = undefined;
    this._main.$$state.update(this._moldPath, this._storagePath, {$loading: true});
    return this._main.$$state.$$request.sendRequest(
        'get', this._moldPath, undefined, metaParams, this.getUrlParams())
      .then((resp) => {
        // update mold with server response data
        this._main.$$state.update(this._moldPath, this._storagePath, {$loading: false});

        this._main.$$state.update(this._moldPath, this._storagePath, resp.body);
        this._lastChanges = {};

        return resp;
      }, (err) => {
        this._main.$$state.update(this._moldPath, this._storagePath, {$loading: false});
        return Promise.reject(err);
      });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @returns {Promise}
   */
  put(newState=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.update(this._moldPath, this._storagePath, {$saving: true});

    const metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
        'put', this._moldPath, this._mold, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.update(this._moldPath, this._storagePath, {
        ...resp.body,
        $saving: false,
      });
      this._lastChanges = {};

      return resp;
    }, (err) => {
      this._main.$$state.update(this._moldPath, this._storagePath, {$saving: false});
      return Promise.reject(err);
    });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @returns {Promise}
   */
  patch(newState=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.update(this._moldPath, this._storagePath, {$saving: true});

    const metaParams = undefined;
    return this._main.$$state.$$request.sendRequest(
      'patch', this._moldPath, this._lastChanges, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.update(this._moldPath, this._storagePath, {
        ...resp.body,
        $saving: false,
      });
      this._lastChanges = {};

      return resp;
    }, (err) => {
      this._main.$$state.update(this._moldPath, this._storagePath, {$saving: false});
      return Promise.reject(err);
    });
  }

}
