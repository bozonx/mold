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
    // TODO: номер страницы надо передать в sourceParams или в documentsParams
    return this._main.$$state.$$request.loadDocumentsCollection(this._root, this.getUrlParams())
      .then((resp) => {
        // update mold with server response data
        // TODO: нужно вставлять только в нужную страницу
        // TODO: use setPage()
        this._main.$$state.update(concatPath(this._root, 0), resp.body);
        return resp;
      });
  }

  /**
   * Send request to create document.
   * You can use recently added document.
   * @param {object} document
   * @returns {Promise}
   */
  createDocument(document) {
    // TODO: менять статус через storage с подъемом события
    document.$adding = true;
    return this._main.$$state.$$request.createDocument(this._root, this.getUrlParams(), document)
      .then((resp) => {
        delete document.$addedUnsaved;
        delete document.$adding;
        return resp;
      }, (err) => {
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
    // TODO: менять статус через storage с подъемом события
    document.$deleting = true;
    return this._main.$$state.$$request.deleteDocument(this._root, this.getUrlParams(), document)
      .then((resp) => {
        delete document.$deleting;
        return resp;
      }, (err) => {
        delete document.$deleting;
        return err;
      });
  }

}
