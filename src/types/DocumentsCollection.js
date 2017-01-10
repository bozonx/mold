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
    return this._loading;
  }

  $init(moldPath) {
    this._storagePath = moldPath + '.pages';
    this._mold = this._main.$$state.getMold(moldPath);
    super.$init(moldPath);
    this._moldPages = this._mold.pages;

    this._mold.state = {
      loading: [],
    };
    this._loading = this._mold.state.loading;
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
    if (!_.isNumber(pageNum)) this._main.$$log.fatal(`The "pageNum" param is required!`);

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
    // rise an event
    this._main.$$storage.emit(this._moldPath);

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
   * @param {object} documentMold
   * @param {object} metaParams
   * @returns {Promise}
   */
  create(documentMold, metaParams=undefined) {
    // change with event rising
    this._updateDoc(documentMold, {
      $saving: true,
    });

    return this._main.$$state.$$request.sendRequest(
        'create', this._moldPath, documentMold, metaParams, this.getUrlParams())
      .then((resp) => {
        // update document if it's in storage
        this._updateDoc(documentMold, {
          ...resp.body,
          $addedUnsaved: undefined,
          $saving: false,
        });

        // remove for any way
        delete documentMold.$addedUnsaved;

        return resp;
      }, (err) => {
        this._updateDoc(documentMold, {
          $saving: false,
        });
        return Promise.reject(err);
      });
  }

  /**
   * Send request to delete document.
   * It adds "$deleting" prop to document.
   * After success response, it remove document from mold.
   * @param {object} documentMold
   * @param {object} metaParams
   * @returns {Promise}
   */
  deleteDocument(documentMold, metaParams=undefined) {
    // console.log(1111, documentMold)
    //
    // const document = this.child(`[${documentMold.$pageIndex}][${documentMold.$index}]`);
    //
    // console.log(22222, document)
    //
    // document.remove(metaParams);


    // change with event rising
    this._updateDoc(documentMold, { $deleting: true });
    return this._main.$$state.$$request.sendRequest(
        'delete', this._moldPath, documentMold, metaParams, this.getUrlParams())
      .then((resp) => {
        this._updateDoc(documentMold, { $deleting: false });
        // remove from page
        if (_.isNumber(documentMold.$pageIndex)) {
          this._main.$$state.remove(this._moldPath, this._storagePath, documentMold, documentMold.$pageIndex);
        }
        return resp;
      }, (err) => {
        this._updateDoc(documentMold, { $deleting: false });
        return Promise.reject(err);
      });
  }

  _updateDoc(documentMold, newState) {
    if (!_.isNumber(documentMold.$pageIndex) || !_.isNumber(documentMold.$index)) return;
    const pathToDoc = concatPath(concatPath(this._moldPath, documentMold.$pageIndex), documentMold.$index);
    const storagePathToDoc = concatPath(concatPath(this._storagePath, documentMold.$pageIndex), documentMold.$index);
    this._main.$$state.update(pathToDoc, storagePathToDoc, newState);
  }

  _setPageLoadingState(pageNum, loading) {
    if (loading) {
      this._loading.push(pageNum);
      return;
    }

    // remove page's loading state

    const findedIndex = _.findIndex(this._loading, (item) => {
      return item === pageNum;
    });

    // if it didn't find - do nothing
    if (findedIndex === -1) return;

    // remove page from loading state
    this._loading.splice(findedIndex, 1);
  }

}
