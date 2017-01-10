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
   * @param {object} metaParams
   * @returns {Promise}
   */
  load(metaParams=undefined) {
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
   * @param {object} metaParams
   * @returns {Promise}
   */
  put(newState=undefined, metaParams=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.update(this._moldPath, this._storagePath, {$saving: true});

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
   * @param {object} metaParams
   * @returns {Promise}
   */
  patch(newState=undefined, metaParams=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.update(this._moldPath, this._storagePath, {$saving: true});

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

  remove(metaParams=undefined) {
    // TODO: как выяснить что это документ в коллекции - у него есть $pageNum

    console.log(333333333, this._moldPath, this._storagePath)

    return;

    // TODO: !!!!!
    const moldPathToCollection = '';
    // TODO: url params брать коллекции или документа??? или объединенные?
    const urlParams = this.getUrlParams();



    this._main.$$state.update(this._moldPath, this._storagePath, { $deleting: true });

    return this._main.$$state.$$request.sendRequest(
      'delete', moldPathToCollection, this.mold, metaParams, urlParams)
      .then((resp) => {
        this._main.$$state.update(this._moldPath, this._storagePath, { $deleting: false });
        // remove from page
        if (_.isNumber(this.mold.$pageIndex)) {
          this._main.$$state.remove(this._moldPath, this._storagePath, this.mold, this.mold.$pageIndex);
        }
        return resp;
      }, (err) => {
        this._main.$$state.update(this._moldPath, this._storagePath, { $deleting: false });
        return Promise.reject(err);
      });
  }

}
