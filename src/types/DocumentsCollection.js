import _ from 'lodash';

import { concatPath } from '../helpers';
import PagedCollection from './PagedCollection';


export default class DocumentsCollection extends PagedCollection{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'documentsCollection';
  }

  get loading() {
    //return this.mold.$loading;
  }

  $init(moldPath) {
    this._storagePath = moldPath + '.pages';
    this._mold = this._main.$$state.getMold(moldPath);
    super.$init(moldPath);
    this._moldPages = this._mold['pages'];
  }

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._moldPath);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._moldPath, params);
  }

  /**
   * Load the specified page.
   * It updates mold automatically.
   * @param {number} pageNum
   * @param {object} metaOverrides - override request's meta params
   * @returns {Promise}
   */
  load(pageNum, metaOverrides) {
    if (!_.isNumber(pageNum)) throw new Error(`The "pageNum" param is required!`);

    let metaParams = _.omitBy({
      pageNum: pageNum,
      perPage: this._perPage,
    }, _.isUndefined);

    if (_.isPlainObject(metaOverrides)) {
      metaParams = {
        ...metaParams,
        ...metaOverrides,
      }
    }

    this._setPageLoadingState(pageNum, true);

    return this._main.$$state.$$request.sendRequest(
        'filter', this._moldPath, undefined, metaParams, this.getUrlParams())
      .then((resp) => {
        this._setPageLoadingState(pageNum, false);
        // update mold with server response data
        this.setPage(resp.body, pageNum);

        return resp;
      }, (err) => {
        this._setPageLoadingState(pageNum, false);
        return Promise.reject(err);
      });
  }

  /**
   * Send request to create document.
   * You can use recently added document.
   * @param {object} document
   * @returns {Promise}
   */
  create(document) {
    const metaParams = undefined;
    // change with event rising
    this._updateDoc(document, {
      $saving: true,
    });

    return this._main.$$state.$$request.sendRequest(
        'create', this._moldPath, document, metaParams, this.getUrlParams())
      .then((resp) => {
        // update document if it's in storage
        this._updateDoc(document, {
          ...resp.body,
          $addedUnsaved: undefined,
          $saving: false,
        });

        // remove for any way
        delete document.$addedUnsaved;

        return resp;
      }, (err) => {
        this._updateDoc(document, {
          $saving: false,
        });
        return err;
      });
  }

  /**
   * Send request to delete document.
   * It adds "$deleting" prop to document.
   * After success response, it remove document from mold.
   * @param {object} document
   * @returns {Promise}
   */
  deleteDocument(document) {
    // TODO: может делать вызов в Document type
    // TODO: поддержка $deleting
    const metaParams = undefined;
    // change with event rising
    this._updateDoc(document, { $deleting: true });
    return this._main.$$state.$$request.sendRequest(
        'delete', this._moldPath, document, metaParams, this.getUrlParams())
      .then((resp) => {
        this._updateDoc(document, { $deleting: false });
        // remove from page
        if (_.isNumber(document.$pageIndex)) {
          this._main.$$state.remove(this._moldPath, this._storagePath, document, document.$pageIndex);
        }
        return resp;
      }, (err) => {
        this._updateDoc(document, { $deleting: false });
        return err;
      });
  }

  _updateDoc(document, newState) {
    if (!_.isNumber(document.$pageIndex) || !_.isNumber(document.$index)) return;
    const pathToDoc = concatPath(concatPath(this._moldPath, document.$pageIndex), document.$index);
    const storagePathToDoc = concatPath(concatPath(this._storagePath, document.$pageIndex), document.$index);
    this._main.$$state.update(pathToDoc, storagePathToDoc, newState);
  }

  _setPageLoadingState(pageNum, loading) {
    //this._main.$$state.update(this._moldPath, this._storagePath, {$loading: false});
    //this._storagePath = moldPath + '.pages';
    //this._mold = this._main.$$state.getMold(moldPath);
  }
}
