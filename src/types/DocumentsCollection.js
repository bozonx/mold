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

  $init(root) {
    super.$init(root);
  }

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._root);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._root, params);
  }

  /**
   * Load the specified page.
   * It updates mold automatically.
   * @param pageNum
   * @returns {Promise}
   */
  load(pageNum) {
    if (!_.isNumber(pageNum)) throw new Error(`The "pageNum" param is required!`);

    let metaParams = _.omitBy({
      pageNum: pageNum,
      perPage: this._perPage,
    }, _.isUndefined);

    return this._main.$$state.$$request.sendRequest(
        'filter', this._root, undefined, metaParams, this.getUrlParams())
      .then((resp) => {
        // update mold with server response data
        this.setPage(resp.body, pageNum);

        return resp;
      });
  }

  /**
   * Send request to create document.
   * You can use recently added document.
   * @param {object} document
   * @returns {Promise}
   */
  create(document) {
    let metaParams = undefined;
    // change with event rising
    this._updateDoc(document, { $adding: true });
    document.$adding = true;
    return this._main.$$state.$$request.sendRequest(
        'create', this._root, document, metaParams, this.getUrlParams())
      .then((resp) => {
        // update document if it's in storage
        // TODO: после обновления $adding === undefined, но на самом деле он не удаляется
        this._updateDoc(document, {
          ...resp.body,
          $addedUnsaved: undefined,
          $adding: undefined,
        });

        // remove for any way
        delete document.$addedUnsaved;
        delete document.$adding;

        return resp;
      }, (err) => {
        this._updateDoc(document, {
          $adding: undefined,
        });
        delete document.$adding;
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
    let metaParams = undefined;
    // change with event rising
    this._updateDoc(document, { $deleting: true });
    document.$deleting = true;
    return this._main.$$state.$$request.sendRequest(
        'delete', this._root, document, metaParams, this.getUrlParams())
      .then((resp) => {
        delete document.$deleting;
        // remove from page
        if (_.isNumber(document.$pageIndex)) {
          this._main.$$state.remove(this._root, document, document.$pageIndex);
        }
        return resp;
      }, (err) => {
        this._updateDoc(document, {
          $deleting: undefined,
        });
        delete document.$deleting;
        return err;
      });
  }

  _updateDoc(document, newState) {
    if (!_.isNumber(document.$pageIndex) || !_.isNumber(document.$index)) return;
    let pathToDoc = concatPath(concatPath(this._root, document.$pageIndex), document.$index);
    this._main.$$state.update(pathToDoc, newState);
  }

}
